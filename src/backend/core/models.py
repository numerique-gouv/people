"""
Declare and configure the models for the People core application
"""

import json
import os
import smtplib
import uuid
from contextlib import suppress
from datetime import timedelta
from logging import getLogger
from typing import Tuple

from django.conf import settings
from django.contrib.auth import models as auth_models
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.postgres.fields import ArrayField
from django.contrib.sites.models import Site
from django.core import exceptions, mail, validators
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.functional import lazy
from django.utils.translation import gettext_lazy as _
from django.utils.translation import override

import jsonschema
from timezone_field import TimeZoneField

from core.enums import WebhookStatusChoices
from core.utils.webhooks import scim_synchronizer
from core.validators import get_field_validators_from_setting

logger = getLogger(__name__)

current_dir = os.path.dirname(os.path.abspath(__file__))
contact_schema_path = os.path.join(current_dir, "jsonschema", "contact_data.json")
with open(contact_schema_path, "r", encoding="utf-8") as contact_schema_file:
    contact_schema = json.load(contact_schema_file)


class RoleChoices(models.TextChoices):
    """Defines the possible roles a user can have in a team."""

    MEMBER = "member", _("Member")
    ADMIN = "administrator", _("Administrator")
    OWNER = "owner", _("Owner")


class OrganizationRoleChoices(models.TextChoices):
    """
    Defines the possible roles a user can have in an organization.
    For now, we only have one role, but we might add more in the future.

    administrator: The user can manage the organization: change name, add/remove users.
    """

    ADMIN = "administrator", _("Administrator")


class BaseModel(models.Model):
    """
    Serves as an abstract base model for other models, ensuring that records are validated
    before saving as Django doesn't do it by default.

    Includes fields common to all models: a UUID primary key and creation/update timestamps.
    """

    id = models.UUIDField(
        verbose_name=_("id"),
        help_text=_("primary key for the record as UUID"),
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    created_at = models.DateTimeField(
        verbose_name=_("created at"),
        help_text=_("date and time at which a record was created"),
        auto_now_add=True,
        editable=False,
    )
    updated_at = models.DateTimeField(
        verbose_name=_("updated at"),
        help_text=_("date and time at which a record was last updated"),
        auto_now=True,
        editable=False,
    )

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        """Call `full_clean` before saving."""
        self.full_clean()
        return super().save(*args, **kwargs)


class Contact(BaseModel):
    """User contacts"""

    base = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        related_name="overriding_contacts",
        null=True,
        blank=True,
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="contacts",
        null=True,
        blank=True,
    )
    full_name = models.CharField(_("full name"), max_length=150, null=True, blank=True)
    short_name = models.CharField(_("short name"), max_length=30, null=True, blank=True)

    # avatar =
    # notes =
    data = models.JSONField(
        _("contact information"),
        help_text=_("A JSON object containing the contact information"),
        blank=True,
    )

    class Meta:
        db_table = "people_contact"
        # indexes = [
        #     GinIndex(
        #         fields=["full_name", "short_name"],
        #         name="names_gin_trgm_idx",
        #         opclasses=['gin_trgm_ops', 'gin_trgm_ops']
        #     ),
        # ]
        ordering = ("full_name", "short_name")
        verbose_name = _("contact")
        verbose_name_plural = _("contacts")
        unique_together = ("owner", "base")
        constraints = [
            models.CheckConstraint(
                condition=~models.Q(base__isnull=False, owner__isnull=True),
                name="base_owner_constraint",
                violation_error_message="A contact overriding a base contact must be owned.",
            ),
            models.CheckConstraint(
                condition=~models.Q(base=models.F("id")),
                name="base_not_self",
                violation_error_message="A contact cannot be based on itself.",
            ),
        ]

    def __str__(self):
        return self.full_name or self.short_name

    def clean(self):
        """Validate fields."""
        super().clean()

        # Check if the contact points to a base contact that itself points to another base contact
        if self.base_id and self.base.base_id:
            raise exceptions.ValidationError(
                "A contact cannot point to a base contact that itself points to a base contact."
            )

        # Validate the content of the "data" field against our jsonschema definition
        try:
            jsonschema.validate(self.data, contact_schema)
        except jsonschema.ValidationError as e:
            # Specify the property in the data in which the error occurred
            field_path = ".".join(map(str, e.path))
            error_message = f"Validation error in '{field_path:s}': {e.message}"
            raise exceptions.ValidationError({"data": [error_message]}) from e


class ServiceProvider(BaseModel):
    """
    Represents a service provider that will consume our information.

    Organization uses this model to define the list of SP available to their users.
    Team uses this model to define their visibility to the various SP.
    """

    name = models.CharField(_("name"), max_length=256, unique=True)
    audience_id = models.CharField(
        _("audience id"), max_length=256, unique=True, db_index=True
    )

    class Meta:
        db_table = "people_service_provider"
        verbose_name = _("service provider")
        verbose_name_plural = _("service providers")

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Enforce name (even if ugly) from the `audience_id` field."""
        if not self.name:
            self.name = self.audience_id  # ok, same length
        return super().save(*args, **kwargs)


class OrganizationManager(models.Manager):
    """
    Custom manager for the Organization model, to manage complexity/automation.
    """

    def get_or_create_from_user_claims(
        self, registration_id: str = None, domain: str = None, **kwargs
    ) -> Tuple["Organization", bool]:
        """
        Get or create an organization using the most fitting information from the user's claims.

        We expect to have only one organization per registration_id, but
        the registration_id might not be provided.
        When the registration_id is not provided, we use the domain to identify the organization.

        If both are provided, we use the registration_id first to create missing organization.

        Dev note: When a registration_id is provided by the Identity Provider, we don't want
        to use the domain to create the organization, because it is less reliable: for example,
        a professional user, may have a personal email address, and the domain would be gmail.com
        which is not a good identifier for an organization. The domain email is just a fallback
        when the registration_id is not provided by the Identity Provider. We can use the domain
        to create the organization manually when we are sure about the "safety" of it.
        """
        if not any([registration_id, domain]):
            raise ValueError("You must provide either a registration_id or a domain.")

        filters = models.Q()
        if registration_id:
            filters |= models.Q(registration_id_list__icontains=registration_id)
        if domain:
            filters |= models.Q(domain_list__icontains=domain)

        with suppress(self.model.DoesNotExist):
            # If there are several organizations, we must raise an error and fix the data
            # If there is an organization, we return it
            return self.get(filters, **kwargs), False

        # Manage the case where the organization does not exist: we create one
        if registration_id:
            return self.create(
                name=registration_id, registration_id_list=[registration_id], **kwargs
            ), True

        if domain:
            return self.create(name=domain, domain_list=[domain], **kwargs), True

        raise ValueError("Should never reach this point.")


class Organization(BaseModel):
    """
    Organization model used to regroup Teams.

    Each User have an Organization, which corresponds actually to a default organization
    because a user can belong to a Team from another organization.
    Each Team have an Organization, which is the Organization from the User who created
    the Team.

    Organization is managed automatically, the User should never choose their Organization.
    When creating a User, you must use the `get_or_create` method from the
    OrganizationManager to find the proper Organization.

    An Organization can have several registration IDs and domains but during automatic
    creation process, only one will be used. We may want to allow (manual) organization merge
    later, to regroup several registration IDs or domain in the same Organization.
    """

    name = models.CharField(_("name"), max_length=100)
    registration_id_list = ArrayField(
        models.CharField(
            max_length=128,
            validators=get_field_validators_from_setting(
                "ORGANIZATION_REGISTRATION_ID_VALIDATORS"
            ),
        ),
        verbose_name=_("registration ID list"),
        default=list,
        blank=True,
        # list overlap validation is done in the validate_unique method
    )
    domain_list = ArrayField(
        models.CharField(max_length=256),
        verbose_name=_("domain list"),
        default=list,
        blank=True,
        # list overlap validation is done in the validate_unique method
    )

    service_providers = models.ManyToManyField(
        ServiceProvider,
        related_name="organizations",
        blank=True,
    )

    objects = OrganizationManager()

    class Meta:
        db_table = "people_organization"
        verbose_name = _("organization")
        verbose_name_plural = _("organizations")
        constraints = [
            models.CheckConstraint(
                name="registration_id_or_domain",
                condition=models.Q(registration_id_list__len__gt=0)
                | models.Q(domain_list__len__gt=0),
                violation_error_message=_(
                    "An organization must have at least a registration ID or a domain."
                ),
            ),
            # Check a registration ID str can only be present in one
            # organization registration ID list
            # Check a domain str can only be present in one organization domain list
            # Those checks cannot be done with Django constraints
        ]

    def __str__(self):
        return f"{self.name} (# {self.pk})"

    def validate_unique(self, exclude=None):
        """
        Validate Registration/Domain values in an array field are unique
        across all instances.

        This can't be done in the field validator because we need to
        exclude the current object if already in database.
        """
        super().validate_unique(exclude=exclude)

        if self.pk:
            organization_qs = Organization.objects.exclude(pk=self.pk)
        else:
            organization_qs = Organization.objects.all()

        # Check a registration ID can only be present in one organization
        if (
            self.registration_id_list
            and organization_qs.filter(
                registration_id_list__overlap=self.registration_id_list
            ).exists()
        ):
            raise ValidationError(
                "registration_id_list value must be unique across all instances."
            )

        # Check a domain can only be present in one organization
        if (
            self.domain_list
            and organization_qs.filter(domain_list__overlap=self.domain_list).exists()
        ):
            raise ValidationError(
                "domain_list value must be unique across all instances."
            )


class User(AbstractBaseUser, BaseModel, auth_models.PermissionsMixin):
    """User model to work with OIDC only authentication."""

    sub_validator = validators.RegexValidator(
        regex=r"^[\w.@+-]+\Z",
        message=_(
            "Enter a valid sub. This value may contain only letters, "
            "numbers, and @/./+/-/_ characters."
        ),
    )

    sub = models.CharField(
        _("sub"),
        help_text=_(
            "Required. 255 characters or fewer. Letters, numbers, and @/./+/-/_ characters only."
        ),
        max_length=255,
        unique=True,
        validators=[sub_validator],
    )
    email = models.EmailField(_("email address"), null=True, blank=True)
    name = models.CharField(_("name"), max_length=100, null=True, blank=True)
    profile_contact = models.OneToOneField(
        Contact,
        on_delete=models.SET_NULL,
        related_name="user",
        blank=True,
        null=True,
    )
    language = models.CharField(
        max_length=10,
        choices=lazy(lambda: settings.LANGUAGES, tuple)(),
        default=settings.LANGUAGE_CODE,
        verbose_name=_("language"),
        help_text=_("The language in which the user wants to see the interface."),
    )
    timezone = TimeZoneField(
        choices_display="WITH_GMT_OFFSET",
        use_pytz=False,
        default=settings.TIME_ZONE,
        help_text=_("The timezone in which the user wants to see times."),
    )
    is_device = models.BooleanField(
        _("device"),
        default=False,
        help_text=_("Whether the user is a device or a real user."),
    )
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Whether the user can log into this admin site."),
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_(
            "Whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."
        ),
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name="users",
        null=True,  # Need to be set to False when everything is migrated
        blank=True,  # Need to be set to False when everything is migrated
    )

    objects = auth_models.UserManager()

    USERNAME_FIELD = "sub"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "people_user"
        verbose_name = _("user")
        verbose_name_plural = _("users")

    def __str__(self):
        return self.name if self.name else self.email or f"User {self.sub}"

    def save(self, *args, **kwargs):
        """
        If it's a new user, give her access to the relevant teams.
        """

        if self._state.adding:
            self._convert_valid_invitations()

        super().save(*args, **kwargs)

    def clean(self):
        """Validate fields."""
        super().clean()
        if self.email:
            self.email = User.objects.normalize_email(self.email)

        if self.profile_contact_id and not self.profile_contact.owner == self:
            raise exceptions.ValidationError(
                "Users can only declare as profile a contact they own."
            )

    def _convert_valid_invitations(self):
        """
        Convert valid invitations to team accesses.
        Expired invitations are ignored.
        """

        valid_invitations = Invitation.objects.filter(
            email=self.email,
            created_at__gte=(
                timezone.now()
                - timedelta(seconds=settings.INVITATION_VALIDITY_DURATION)
            ),
        ).select_related("team")

        if not valid_invitations.exists():
            return

        TeamAccess.objects.bulk_create(
            [
                TeamAccess(user=self, team=invitation.team, role=invitation.role)
                for invitation in valid_invitations
            ]
        )
        valid_invitations.delete()

    def email_user(self, subject, message, from_email=None, **kwargs):
        """Email this user."""
        if not self.email:
            raise ValueError("You must first set an email for the user.")
        mail.send_mail(subject, message, from_email, [self.email], **kwargs)

    def get_abilities(self):
        """
        Return the user permissions at the application level (ie feature availability).

        Note: this is for display purposes only for now.

        - Contacts view and creation is globally available (or not) for now.
        - Teams view is available if the user is owner or admin of at least
        one Team for now. It allows to restrict users knowing the existence of
        this feature.
        - Teams creation is globally available (or not) for now.
        - Mailboxes view is available if the user has access to at least one
        MailDomain for now. It allows to restrict users knowing the existence of
        this feature.
        - Mailboxes creation is globally available (or not) for now.
        """
        user_info = (
            self._meta.model.objects.filter(pk=self.pk)
            .annotate(
                teams_can_view=models.Exists(
                    self.accesses.model.objects.filter(  # pylint: disable=no-member
                        user=models.OuterRef("pk"),
                        role__in=[RoleChoices.OWNER, RoleChoices.ADMIN],
                    )
                ),
                mailboxes_can_view=models.Exists(
                    self.mail_domain_accesses.model.objects.filter(  # pylint: disable=no-member
                        user=models.OuterRef("pk")
                    )
                ),
            )
            .only("id")
            .get()
        )

        teams_can_view = user_info.teams_can_view
        mailboxes_can_view = user_info.mailboxes_can_view

        return {
            "contacts": {
                "can_view": settings.FEATURES["CONTACTS_DISPLAY"],
                "can_create": (
                    settings.FEATURES["CONTACTS_DISPLAY"]
                    and settings.FEATURES["CONTACTS_CREATE"]
                ),
            },
            "teams": {
                "can_view": teams_can_view and settings.FEATURES["TEAMS_DISPLAY"],
                "can_create": teams_can_view and settings.FEATURES["TEAMS_CREATE"],
            },
            "mailboxes": {
                "can_view": mailboxes_can_view,
                "can_create": mailboxes_can_view
                and settings.FEATURES["MAILBOXES_CREATE"],
            },
        }


class OrganizationAccess(BaseModel):
    """
    Link table between organization and users,
    only for user with specific rights on Organization.
    """

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="organization_accesses",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="organization_accesses",
    )
    role = models.CharField(
        max_length=20,
        choices=OrganizationRoleChoices.choices,
        default=OrganizationRoleChoices.ADMIN,
    )

    class Meta:
        db_table = "people_organization_access"
        verbose_name = _("Organization/user relation")
        verbose_name_plural = _("Organization/user relations")
        constraints = [
            models.UniqueConstraint(
                fields=["user", "organization"],
                name="unique_organization_user",
                violation_error_message=_("This user is already in this organization."),
            ),
        ]

    def __str__(self):
        return f"{self.user!s} is {self.role:s} in organization {self.organization!s}"


class Team(BaseModel):
    """
    Represents the link between teams and users, specifying the role a user has in a team.

    When a team is created from here, the user have to choose which Service Providers
    can see it.
    When a team is created from a Service Provider this one is automatically set in the
    Team `service_providers`.
    """

    name = models.CharField(max_length=100)

    users = models.ManyToManyField(
        User,
        through="TeamAccess",
        through_fields=("team", "user"),
        related_name="teams",
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name="teams",
        null=True,  # Need to be set to False when everything is migrated
        blank=True,  # Need to be set to False when everything is migrated
    )
    service_providers = models.ManyToManyField(
        ServiceProvider,
        related_name="teams",
        blank=True,
    )

    class Meta:
        db_table = "people_team"
        ordering = ("name",)
        verbose_name = _("Team")
        verbose_name_plural = _("Teams")

    def __str__(self):
        return self.name

    def get_abilities(self, user):
        """
        Compute and return abilities for a given user on the team.
        """
        is_owner_or_admin = False
        role = None

        if user.is_authenticated:
            try:
                role = self.user_role
            except AttributeError:
                try:
                    role = self.accesses.filter(user=user).values("role")[0]["role"]
                except (TeamAccess.DoesNotExist, IndexError):
                    role = None

            is_owner_or_admin = role in [RoleChoices.OWNER, RoleChoices.ADMIN]

        return {
            "get": bool(role),
            "patch": is_owner_or_admin,
            "put": is_owner_or_admin,
            "delete": role == RoleChoices.OWNER,
            "manage_accesses": is_owner_or_admin,
        }


class TeamAccess(BaseModel):
    """Link table between teams and contacts."""

    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="accesses",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="accesses",
    )
    role = models.CharField(
        max_length=20, choices=RoleChoices.choices, default=RoleChoices.MEMBER
    )

    class Meta:
        db_table = "people_team_access"
        verbose_name = _("Team/user relation")
        verbose_name_plural = _("Team/user relations")
        constraints = [
            models.UniqueConstraint(
                fields=["user", "team"],
                name="unique_team_user",
                violation_error_message=_("This user is already in this team."),
            ),
        ]

    def __str__(self):
        return f"{self.user!s} is {self.role:s} in team {self.team!s}"

    def save(self, *args, **kwargs):
        """
        Override save function to fire webhooks on any addition or update
        to a team access.
        """

        if self._state.adding:
            self.team.webhooks.update(status=WebhookStatusChoices.PENDING)
            with transaction.atomic():
                instance = super().save(*args, **kwargs)
                scim_synchronizer.add_user_to_group(self.team, self.user)
        else:
            instance = super().save(*args, **kwargs)

        return instance

    def delete(self, *args, **kwargs):
        """
        Override delete method to fire webhooks on  to team accesses.
        Don't allow deleting a team access until it is successfully synchronized with all
        its webhooks.
        """
        self.team.webhooks.update(status=WebhookStatusChoices.PENDING)
        with transaction.atomic():
            arguments = self.team, self.user
            super().delete(*args, **kwargs)
            scim_synchronizer.remove_user_from_group(*arguments)

    def get_abilities(self, user):
        """
        Compute and return abilities for a given user taking into account
        the current state of the object.
        """
        is_team_owner_or_admin = False
        role = None

        if user.is_authenticated:
            try:
                role = self.user_role
            except AttributeError:
                try:
                    role = self._meta.model.objects.filter(
                        team=self.team_id, user=user
                    ).values("role")[0]["role"]
                except (self._meta.model.DoesNotExist, IndexError):
                    role = None

            is_team_owner_or_admin = role in [RoleChoices.OWNER, RoleChoices.ADMIN]

        if self.role == RoleChoices.OWNER:
            can_delete = (
                user.id == self.user_id
                and self.team.accesses.filter(role=RoleChoices.OWNER).count() > 1
            )
            set_role_to = [RoleChoices.ADMIN, RoleChoices.MEMBER] if can_delete else []
        else:
            can_delete = is_team_owner_or_admin
            set_role_to = []
            if role == RoleChoices.OWNER:
                set_role_to.append(RoleChoices.OWNER)
            if is_team_owner_or_admin:
                set_role_to.extend([RoleChoices.ADMIN, RoleChoices.MEMBER])

        # Remove the current role as we don't want to propose it as an option
        try:
            set_role_to.remove(self.role)
        except ValueError:
            pass

        return {
            "delete": can_delete,
            "get": bool(role),
            "patch": bool(set_role_to),
            "put": bool(set_role_to),
            "set_role_to": set_role_to,
        }


class TeamWebhook(BaseModel):
    """Webhooks fired on changes in teams."""

    team = models.ForeignKey(Team, related_name="webhooks", on_delete=models.CASCADE)
    url = models.URLField(_("url"))
    secret = models.CharField(_("secret"), max_length=255, null=True, blank=True)
    status = models.CharField(
        max_length=10,
        default=WebhookStatusChoices.PENDING,
        choices=WebhookStatusChoices.choices,
    )

    class Meta:
        db_table = "people_team_webhook"
        verbose_name = _("Team webhook")
        verbose_name_plural = _("Team webhooks")

    def __str__(self):
        return f"Webhook to {self.url} for {self.team}"

    def get_headers(self):
        """Build header dict from webhook object."""
        headers = {"Content-Type": "application/json"}
        if self.secret:
            headers["Authorization"] = f"Bearer {self.secret:s}"
        return headers


class Invitation(BaseModel):
    """User invitation to teams."""

    email = models.EmailField(_("email address"), null=False, blank=False)
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="invitations",
    )
    role = models.CharField(
        max_length=20, choices=RoleChoices.choices, default=RoleChoices.MEMBER
    )
    issuer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="invitations",
    )

    class Meta:
        db_table = "people_invitation"
        verbose_name = _("Team invitation")
        verbose_name_plural = _("Team invitations")
        constraints = [
            models.UniqueConstraint(
                fields=["email", "team"], name="email_and_team_unique_together"
            )
        ]

    def __str__(self):
        return f"{self.email} invited to {self.team}"

    def save(self, *args, **kwargs):
        """Make invitations read-only."""
        if self.created_at:
            raise exceptions.PermissionDenied()
        super().save(*args, **kwargs)

        self.email_invitation()

    def clean(self):
        """Validate fields."""
        super().clean()

        # Check if a user already exists for the provided email
        if User.objects.filter(email=self.email).exists():
            raise exceptions.ValidationError(
                {"email": _("This email is already associated to a registered user.")}
            )

    @property
    def is_expired(self):
        """Calculate if invitation is still valid or has expired."""
        if not self.created_at:
            return None

        validity_duration = timedelta(seconds=settings.INVITATION_VALIDITY_DURATION)
        return timezone.now() > (self.created_at + validity_duration)

    def get_abilities(self, user):
        """Compute and return abilities for a given user."""
        can_delete = False
        role = None

        if user.is_authenticated:
            try:
                role = self.user_role
            except AttributeError:
                try:
                    role = self.team.accesses.filter(user=user).values("role")[0][
                        "role"
                    ]
                except (self._meta.model.DoesNotExist, IndexError):
                    role = None

            can_delete = role in [RoleChoices.OWNER, RoleChoices.ADMIN]

        return {
            "delete": can_delete,
            "get": bool(role),
            "patch": False,
            "put": False,
        }

    def email_invitation(self):
        """Email invitation to the user."""
        try:
            with override(self.issuer.language):
                template_vars = {
                    "title": _("Invitation to join Desk!"),
                    "site": Site.objects.get_current(),
                }
                msg_html = render_to_string("mail/html/invitation.html", template_vars)
                msg_plain = render_to_string("mail/text/invitation.txt", template_vars)
                mail.send_mail(
                    _("Invitation to join Desk!"),
                    msg_plain,
                    settings.EMAIL_FROM,
                    [self.email],
                    html_message=msg_html,
                    fail_silently=False,
                )

        except smtplib.SMTPException as exception:
            logger.error("invitation to %s was not sent: %s", self.email, exception)
