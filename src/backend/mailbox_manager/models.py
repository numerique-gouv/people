"""
Declare and configure the models for the People additional application : mailbox_manager
"""

import logging

from django.conf import settings
from django.core import exceptions, validators
from django.db import models, transaction
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

import requests
from urllib3.util import Retry

from core.models import BaseModel, RoleChoices

logger = logging.getLogger(__name__)

adapter = requests.adapters.HTTPAdapter(
    max_retries=Retry(
        total=4,
        backoff_factor=0.1,
        status_forcelist=[500, 502],
        allowed_methods=["PATCH"],
    )
)

session = requests.Session()
session.mount("http://", adapter)


class MailDomain(BaseModel):
    """Domain names from which we will create email addresses (mailboxes)."""

    name = models.CharField(
        _("name"), max_length=150, null=False, blank=False, unique=True
    )
    slug = models.SlugField(null=False, blank=False, unique=True, max_length=80)
    secret = models.CharField(_("secret"), max_length=255, null=True, blank=True)

    class Meta:
        db_table = "people_mail_domain"
        verbose_name = _("Mail domain")
        verbose_name_plural = _("Mail domains")

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Override save function to compute the slug."""
        self.slug = self.get_slug()
        return super().save(*args, **kwargs)

    def get_slug(self):
        """Compute slug value from name."""
        return slugify(self.name)

    def get_abilities(self, user):
        """
        Compute and return abilities for a given user on the domain.
        """
        is_owner_or_admin = False
        role = None

        if user.is_authenticated:
            try:
                role = self.accesses.filter(user=user).values("role")[0]["role"]
            except (MailDomainAccess.DoesNotExist, IndexError):
                role = None

        is_owner_or_admin = role in [RoleChoices.OWNER, RoleChoices.ADMIN]

        return {
            "get": bool(role),
            "patch": is_owner_or_admin,
            "put": is_owner_or_admin,
            "delete": role == RoleChoices.OWNER,
            "manage_accesses": is_owner_or_admin,
        }

    def get_headers(self):
        """Build header dict from webhook object."""
        # self.secret is the encoded basic auth, to request a new token from dimail-api
        headers = {"Content-Type": "application/json"}

        response = requests.get(
            f"{settings.MAIL_PROVISIONER_URL}/token/",
            headers={"Authorization": f"Basic {self.secret}"},
            timeout=200,
        )

        if response.json() == "{'detail': 'Permission denied'}":
            raise exceptions.PermissionDenied(
                "This secret does not allow for a new token."
            )

        # import pdb; pdb.set_trace()

        if "access_token" in response.json():
            headers["Authorization"] = f"Bearer {response.json()['access_token']}"

        return headers


class MailDomainAccess(BaseModel):
    """Allow to manage users' accesses to mail domains."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mail_domain_accesses",
        null=False,
        blank=False,
    )
    domain = models.ForeignKey(
        MailDomain,
        on_delete=models.CASCADE,
        related_name="accesses",
        null=False,
        blank=False,
    )
    role = models.CharField(
        max_length=20, choices=RoleChoices.choices, default=RoleChoices.MEMBER
    )

    class Meta:
        db_table = "people_mail_domain_accesses"
        verbose_name = _("User/mail domain relation")
        verbose_name_plural = _("User/mail domain relations")
        unique_together = ("user", "domain")

    def __str__(self):
        return f"Access of user {self.user} on domain {self.domain}."


class Mailbox(BaseModel):
    """Mailboxes for users from mail domain."""

    local_part = models.CharField(
        _("local_part"),
        max_length=150,
        null=False,
        blank=False,
        validators=[validators.RegexValidator(regex="^[a-zA-Z0-9_.+-]+$")],
    )
    domain = models.ForeignKey(
        MailDomain,
        on_delete=models.CASCADE,
        related_name="mail_domain",
        null=False,
        blank=False,
    )
    secondary_email = models.EmailField(
        _("secondary email address"), null=False, blank=False
    )

    class Meta:
        db_table = "people_mail_box"
        verbose_name = _("Mailbox")
        verbose_name_plural = _("Mailboxes")
        unique_together = ("local_part", "domain")

    def __str__(self):
        return f"{self.local_part!s}@{self.domain.name:s}"

    def save(self, *args, **kwargs):
        """
        Override save function to fire webhooks on mailbox creation and modification.
        """

        if not self.domain.secret:
            raise exceptions.FieldError(
                "Please configure your domain's secret before creating any mailbox."
            )

        if self._state.adding:
            with transaction.atomic():
                self.send_mailbox_request(self.local_part)
                instance = super().save(*args, **kwargs)

        else:
            instance = super().save(*args, **kwargs)

        return instance

    def send_mailbox_request(self, local_part):
        """Send a CREATE mailbox request to mail provisioning API."""

        payload = {
            "email": f"{local_part}@{self.domain}",
            "givenName": local_part,
            "surName": "Test",
            "displayName": f"{local_part} Test",
        }

        try:
            response = session.post(
                f"{settings.MAIL_PROVISIONER_URL}/domains/{self.domain}/mailboxes/",
                json=payload,
                headers=self.domain.get_headers(),
                # verify=False,
                verify=True,
                # verify=self.get_settings("OIDC_VERIFY_SSL", True),
                timeout=10,
            )
        except requests.exceptions.ConnectionError as e:
            raise e

        print(response.json())  # noqa T201 - Needed to get password of new mailbox
        return response
