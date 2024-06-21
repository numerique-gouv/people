"""Admin classes and registrations for People's mailbox manager app."""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from mailbox_manager import models


class MailDomainWebhookInline(admin.TabularInline):
    """Inline admin class for domains webhooks."""

    extra = 0
    autocomplete_fields = ["domain"]
    model = models.MailDomainWebhook
    readonly_fields = ("created_at", "updated_at")


@admin.register(models.MailDomain)
class MailDomainAdmin(admin.ModelAdmin):
    """Mail domain admin interface declaration."""

    inlines = [MailDomainWebhookInline]
    list_display = (
        "name",
        "created_at",
        "updated_at",
        "slug",
    )
    search_fields = ("name",)
    readonly_fields = ["created_at", "slug"]


@admin.register(models.MailDomainAccess)
class MailDomainAccessAdmin(admin.ModelAdmin):
    """Admin for mail domain accesses model."""

    list_display = ("user", "domain")


@admin.register(models.Mailbox)
class MailboxAdmin(admin.ModelAdmin):
    """Admin for mailbox model."""

    list_display = ("__str__", "domain")
