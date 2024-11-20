"""Users serializers for the People core app."""

from rest_framework import serializers
from timezone_field.rest_framework import TimeZoneSerializerField

from core import models

from .base import DynamicFieldsModelSerializer


class UserSerializer(DynamicFieldsModelSerializer):
    """Serialize users."""

    timezone = TimeZoneSerializerField(use_pytz=False, required=True)
    email = serializers.ReadOnlyField()
    name = serializers.ReadOnlyField()

    class Meta:
        model = models.User
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


class UserMeSerializer(UserSerializer):
    """
    Serialize the current user.

    Same as the `UserSerializer` but with abilities.
    """

    abilities = serializers.SerializerMethodField()

    class Meta:
        model = models.User
        fields = [
            "email",
            "id",
            "is_device",
            "is_staff",
            "language",
            "name",
            "timezone",
            # added fields
            "abilities",
        ]
        read_only_fields = ["id", "name", "email", "is_device", "is_staff"]

    def get_abilities(self, user: models.User) -> dict:
        """Return abilities of the logged-in user on the instance."""
        if user != self.context["request"].user:  # Should not happen
            raise RuntimeError(
                "UserMeSerializer.get_abilities: user is not the same as the request user",
            )
        return user.get_abilities()
