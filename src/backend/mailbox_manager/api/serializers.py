"""Client serializers for People's mailbox manager app."""

from rest_framework import exceptions, serializers
from timezone_field.rest_framework import TimeZoneSerializerField

from core.api.serializers import DynamicFieldsModelSerializer
from core.models import User

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
    """Serialize mail domain accesses."""

    abilities = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = models.MailDomainAccess
        fields = [
            "id",
            "user",
            "role",
            "abilities",
        ]
        read_only_fields = ["id", "abilities"]

    def get_abilities(self, access) -> dict:
        """Return abilities of the logged-in user on the instance."""
        request = self.context.get("request")
        if request:
            return access.get_abilities(request.user)
        return {}

    def validate(self, attrs):
        """
        Check access rights specific to writing (create/update)
        """
        request = self.context.get("request")
        user = getattr(request, "user", None)
        role = attrs.get("role")

        # Update
        if self.instance:
            can_set_role_to = self.instance.get_abilities(user)["set_role_to"]

            if role and role not in can_set_role_to:
                message = (
                    f"You are only allowed to set role to {', '.join(can_set_role_to)}"
                    if can_set_role_to
                    else "You are not allowed to set this role for this domain."
                )
                raise exceptions.PermissionDenied(message)

        # Create
        else:
            try:
                domain_slug = self.context["domain_slug"]
            except KeyError as exc:
                raise exceptions.ValidationError(
                    "You must set a domain slug in kwargs to create a new domain access."
                ) from exc

            if not models.MailDomainAccess.objects.filter(
                domain__slug=domain_slug,
                user=user,
                role__in=[
                    enums.MailDomainRoleChoices.OWNER,
                    enums.MailDomainRoleChoices.ADMIN,
                ],
            ).exists():
                raise exceptions.PermissionDenied(
                    "You are not allowed to manage accesses for this domain."
                )

            if (
                role == enums.MailDomainRoleChoices.OWNER
                and not models.MailDomainAccess.objects.filter(
                    domain__slug=domain_slug,
                    user=user,
                    role=enums.MailDomainRoleChoices.OWNER,
                ).exists()
            ):
                raise exceptions.PermissionDenied(
                    "Only owners of a domain can assign other users as owners."
                )

        attrs["domain"] = models.MailDomain.objects.get(
            slug=self.context["domain_slug"]
        )
        return attrs


class UserSerializer(DynamicFieldsModelSerializer):
    """Serialize users."""

    timezone = TimeZoneSerializerField(use_pytz=False, required=True)
    email = serializers.ReadOnlyField()
    name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "language",
            "name",
            "timezone",
            "is_device",
            "is_staff",
        ]
        read_only_fields = ["id", "name", "email", "is_device", "is_staff"]


class MailDomainAccessReadOnlySerializer(MailDomainAccessSerializer):
    """Serialize mail domain accesses for list and retrieve actions."""

    user = UserSerializer(read_only=True, fields=["id", "name", "email"])

    class Meta:
        model = models.MailDomainAccess
        fields = [
            "id",
            "user",
            "role",
            "abilities",
        ]
        read_only_fields = [
            "id",
            "user",
            "role",
            "abilities",
        ]
