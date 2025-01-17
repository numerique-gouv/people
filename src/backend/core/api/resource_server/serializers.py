"""Client serializers for the People core app resource server API."""

from rest_framework import serializers

from core import models


class TeamSerializer(serializers.ModelSerializer):
    """Serialize teams."""

    class Meta:
        model = models.Team
        fields = [
            "id",
            "created_at",
            "depth",
            "name",
            "numchild",
            "path",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "depth",
            "numchild",
            "path",
            "updated_at",
        ]

    def create(self, validated_data):
        """
        Create a new team with organization enforcement.

        In this context, called as a resource server,
        the team service provider is enforced.

        When the service provider audience is unknown it is created on the fly.
        """
        sp_audience = self.context["from_service_provider_audience"]
        service_provider, _created = models.ServiceProvider.objects.get_or_create(
            audience_id=sp_audience
        )

        # Note: this is not the purpose of this API to check the user has an organization
        return super().create(
            validated_data=validated_data
            | {
                "organization_id": self.context["request"].user.organization_id,
                "service_providers": [service_provider],
            },
        )
