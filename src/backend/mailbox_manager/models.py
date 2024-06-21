"""
Declare and configure the models for the People additional application : mailbox_manager
"""

import requests
from django.conf import settings
from django.core import validators
from django.db import models, transaction
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _


from core.models import BaseModel, RoleChoices, WebhookStatusChoices
from mailbox_manager.utils.webhooks import scim_synchronizer


class MailDomain(BaseModel):
    """Domain names from which we will create email addresses (mailboxes)."""

    name = models.CharField(
        _("name"), max_length=150, null=False, blank=False, unique=True
    )
    slug = models.SlugField(null=False, blank=False, unique=True, max_length=80)

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

        if self._state.adding:
            print("JE SUIS LAAA")

            self.domain.webhooks.update(status=WebhookStatusChoices.PENDING)
            with transaction.atomic():
                instance = super().save(*args, **kwargs)
                scim_synchronizer.create_mailbox(self.domain, self.local_part)
        else:
            instance = super().save(*args, **kwargs)

        return instance


class MailDomainWebhook(BaseModel):
    """Webhooks fired on changes in domains."""

    domain = models.ForeignKey(
        MailDomain, related_name="webhooks", on_delete=models.CASCADE
    )
    url = models.URLField(_("url"))
    secret = models.CharField(_("secret"), max_length=255, null=True, blank=True)
    status = models.CharField(
        max_length=10,
        default=WebhookStatusChoices.PENDING,
        choices=WebhookStatusChoices.choices,
    )

    class Meta:
        db_table = "people_maildomain_webhook"
        verbose_name = _("MailDomain webhook")
        verbose_name_plural = _("MailDomain webhooks")

    def __str__(self):
        return f"Webhook to {self.url} for {self.domain}"

    def get_headers(self):
        """Build header dict from webhook object."""
        headers = {"Content-Type": "application/json"}

        # self.secret is the encoded basic auth, to request a new token from dimail-api
        response = requests.get(
            "http://host.docker.internal:8000/token/",
            headers={"Authorization": "Basic ZGVzazpwYXNzd29yZA=="},
        )
        print("TOKEN RESPONSE IS", response)

        if response.status_code == 401:
            raise Exception("This secret does not allow for a new token.")

        headers["Authorization"] = f"Bearer {response.json()['access_token']}"
        return headers
