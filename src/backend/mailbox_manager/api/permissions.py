"""Permission handlers for the People mailbox manager app."""

from core.api import permissions as core_permissions
from mailbox_manager import models


class AccessPermission(core_permissions.IsAuthenticated):
    """Permission class for access objects."""

    def has_object_permission(self, request, view, obj):
        """Check permission for a given object."""
        abilities = obj.get_abilities(request.user)
        return abilities.get(request.method.lower(), False)



class MailBoxPermission(core_permissions.IsAuthenticated):
    def has_permission(self, request, view):
        # todo: recup permission sur le domain pour en déduire les droits sur les boites mails ?
        # ou bien définir un get_abilities sur les mailbox ?
        domain = models.MailDomain.objects.get(slug=view.kwargs.get("domain_slug", ""))
        abilities = domain.get_abilities(request.user)
        return abilities.get(request.method.lower(), False)
