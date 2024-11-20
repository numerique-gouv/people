"""Contacts API endpoints"""

from django.db.models import Q

from rest_framework import (
    mixins,
    response,
    viewsets,
)

from core import models

from .. import permissions, serializers
from .base import BurstRateThrottle, SustainedRateThrottle


# pylint: disable=too-many-ancestors
class ContactViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """Contact ViewSet"""

    permission_classes = [permissions.IsOwnedOrPublic]
    queryset = models.Contact.objects.all()
    serializer_class = serializers.ContactSerializer
    throttle_classes = [BurstRateThrottle, SustainedRateThrottle]

    def list(self, request, *args, **kwargs):
        """Limit listed users by a query with throttle protection."""
        user = self.request.user
        queryset = self.filter_queryset(self.get_queryset())

        # Exclude contacts that:
        queryset = queryset.filter(
            # - belong to another user (keep public and owned contacts)
            Q(owner__isnull=True) | Q(owner=user),
            # - are profile contacts for a user
            user__isnull=True,
            # - are overriden base contacts
            overriding_contacts__isnull=True,
        )

        # Search by case-insensitive and accent-insensitive similarity
        if query := self.request.GET.get("q", ""):
            queryset = queryset.filter(
                Q(full_name__unaccent__icontains=query)
                | Q(short_name__unaccent__icontains=query)
            )

        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)

    def perform_create(self, serializer):
        """Set the current user as owner of the newly created contact."""
        user = self.request.user
        serializer.validated_data["owner"] = user
        return super().perform_create(serializer)
