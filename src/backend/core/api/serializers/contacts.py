"""Contact serializers for the People core app."""

from rest_framework import serializers

from core import models


class ContactSerializer(serializers.ModelSerializer):
    """Serialize contacts."""

    class Meta:
        model = models.Contact
        fields = [
            "id",
            "base",
            "data",
            "full_name",
            "owner",
            "short_name",
        ]
        read_only_fields = ["id", "owner"]

    def update(self, instance, validated_data):
        """Make "base" field readonly but only for update/patch."""
        validated_data.pop("base", None)
        return super().update(instance, validated_data)
