"""Users API endpoints"""

from django.db.models import Q

from rest_framework import (
    decorators,
    mixins,
    response,
    viewsets,
)

from core import models

from .. import permissions
from ..serializers.users import UserMeSerializer, UserSerializer
from .base import (
    BurstRateThrottle,
    Pagination,
    SerializerPerActionMixin,
    SustainedRateThrottle,
)


# pylint: disable=too-many-ancestors
class UserViewSet(
    SerializerPerActionMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
    mixins.ListModelMixin,
):
    """
    User viewset for all interactions with user infos and teams.

    GET /api/users/&q=query
        Return a list of users whose email or name matches the query.
    """

    permission_classes = [permissions.IsSelf]
    queryset = models.User.objects.all().order_by("-created_at")
    serializer_class = UserSerializer
    get_me_serializer_class = UserMeSerializer
    throttle_classes = [BurstRateThrottle, SustainedRateThrottle]
    pagination_class = Pagination

    def get_queryset(self):
        """Limit listed users by a query. Pagination and throttle protection apply."""
        queryset = self.queryset

        if self.action == "list":
            # Exclude inactive contacts
            queryset = queryset.filter(
                is_active=True,
            )

            # Exclude all users already in the given team
            if team_id := self.request.GET.get("team_id", ""):
                queryset = queryset.exclude(teams__id=team_id)

            # Search by case-insensitive and accent-insensitive
            if query := self.request.GET.get("q", ""):
                queryset = queryset.filter(
                    Q(name__unaccent__icontains=query)
                    | Q(email__unaccent__icontains=query)
                )

        return queryset

    @decorators.action(
        detail=False,
        methods=["get"],
        url_name="me",
        url_path="me",
    )
    def get_me(self, request):
        """
        Return information on currently logged user
        """
        user = request.user
        return response.Response(self.get_serializer(user).data)
