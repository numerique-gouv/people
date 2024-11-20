"""Configuration API endpoints"""

from django.conf import settings

from rest_framework import (
    response,
    views,
)
from rest_framework.permissions import AllowAny


class ConfigView(views.APIView):
    """API ViewSet for sharing some public settings."""

    permission_classes = [AllowAny]

    def get(self, request):
        """
        GET /api/v1.0/config/
            Return a dictionary of public settings.
        """
        array_settings = ["LANGUAGES", "FEATURES", "RELEASE", "COMMIT"]
        dict_settings = {}
        for setting in array_settings:
            dict_settings[setting] = getattr(settings, setting)

        return response.Response(dict_settings)
