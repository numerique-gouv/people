"""Client serializers for People's mailbox manager app."""

from rest_framework import serializers

from core.api.serializers import UserSerializer

from mailbox_manager import enums, models


class MailboxSerializer(serializers.ModelSerializer):
    """Serialize mailbox."""

    class Meta:
        model = models.Mailbox
        fields = ["id", "first_name", "last_name", "local_part", "secondary_email"]
        # everything is actually read-only as we do not allow update for now
        read_only_fields = ["id"]


class MailDomainSerializer(serializers.ModelSerializer):
    """Serialize mail domain."""

    abilities = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = models.MailDomain
        lookup_field = "slug"
        fields = [
            "id",
            "name",
            "slug",
            "status",
            "abilities",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "slug",
            "status",
            "abilities",
            "created_at",
            "updated_at",
        ]

    def get_abilities(self, domain) -> dict:
        """Return abilities of the logged-in user on the instance."""
        request = self.context.get("request")
        if request:
            return domain.get_abilities(request.user)
        return {}


class MailDomainAccessSerializer(serializers.ModelSerializer):
    """Serialize mail domain access."""

    user = UserSerializer(read_only=True, fields=["id", "name", "email"])
    can_set_role_to = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = models.MailDomainAccess
        fields = [
            "id",
            "user",
            "role",
            "can_set_role_to",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at", "can_set_role_to"]

    def get_can_set_role_to(self, access):
        """Return roles available to set"""
        roles = list(enums.MailDomainRoleChoices)
        user_role = access.user_role
        if user_role != enums.MailDomainRoleChoices.OWNER:
            roles.remove(enums.MailDomainRoleChoices.OWNER)
        if user_role == enums.MailDomainRoleChoices.VIEWER or (
            user_role != enums.MailDomainRoleChoices.OWNER
            and access.role == enums.MailDomainRoleChoices.OWNER
        ):
            return []
        # remove role already set
        roles.remove(access.role)
        return sorted(roles)


class MailDomainAccessReadOnlySerializer(MailDomainAccessSerializer):
    """Serialize mail domain access for list and retrieve actions."""

    class Meta:
        model = models.MailDomainAccess
        fields = [
            "id",
            "user",
            "role",
            "can_set_role_to",
        ]
        read_only_fields = [
            "id",
            "user",
            "role",
            "can_set_role_to",
        ]
