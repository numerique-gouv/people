"""API endpoints"""

from django.conf import settings
from django.db.models import OuterRef, Q, Subquery

from rest_framework import (
    decorators,
    exceptions,
    filters,
    mixins,
    response,
    views,
    viewsets,
)
from rest_framework.permissions import AllowAny

from core import models
from .base import BurstRateThrottle, SustainedRateThrottle

from .. import permissions, serializers


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
    serializer_class = serializers.UserSerializer
    get_me_serializer_class = serializers.UserMeSerializer
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


class TeamViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """Team ViewSet"""

    permission_classes = [permissions.AccessPermission]
    serializer_class = serializers.TeamSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]
    queryset = models.Team.objects.all()
    pagination_class = None

    def get_queryset(self):
        """Custom queryset to get user related teams."""
        user_role_query = models.TeamAccess.objects.filter(
            user=self.request.user, team=OuterRef("pk")
        ).values("role")[:1]
        return models.Team.objects.filter(accesses__user=self.request.user).annotate(
            user_role=Subquery(user_role_query)
        )

    def perform_create(self, serializer):
        """Set the current user as owner of the newly created team."""
        team = serializer.save()
        models.TeamAccess.objects.create(
            team=team,
            user=self.request.user,
            role=models.RoleChoices.OWNER,
        )


class TeamAccessViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    API ViewSet for all interactions with team accesses.

    GET /api/v1.0/teams/<team_id>/accesses/:<team_access_id>
        Return list of all team accesses related to the logged-in user or one
        team access if an id is provided.

    POST /api/v1.0/teams/<team_id>/accesses/ with expected data:
        - user: str
        - role: str [owner|admin|member]
        Return newly created team access

    PUT /api/v1.0/teams/<team_id>/accesses/<team_access_id>/ with expected data:
        - role: str [owner|admin|member]
        Return updated team access

    PATCH /api/v1.0/teams/<team_id>/accesses/<team_access_id>/ with expected data:
        - role: str [owner|admin|member]
        Return partially updated team access

    DELETE /api/v1.0/teams/<team_id>/accesses/<team_access_id>/
        Delete targeted team access
    """

    lookup_field = "pk"
    pagination_class = Pagination
    permission_classes = [permissions.AccessPermission]
    queryset = (
        models.TeamAccess.objects.all().select_related("user").order_by("-created_at")
    )
    list_serializer_class = serializers.TeamAccessReadOnlySerializer
    detail_serializer_class = serializers.TeamAccessSerializer

    filter_backends = [filters.OrderingFilter]
    ordering = ["role"]
    ordering_fields = ["role", "user__email", "user__name"]

    def get_permissions(self):
        """User only needs to be authenticated to list team accesses"""
        if self.action == "list":
            permission_classes = [permissions.IsAuthenticated]
        else:
            return super().get_permissions()

        return [permission() for permission in permission_classes]

    def get_serializer_context(self):
        """Extra context provided to the serializer class."""
        context = super().get_serializer_context()
        context["team_id"] = self.kwargs["team_id"]
        return context

    def get_serializer_class(self):
        """Chooses list or detail serializer according to the action."""
        if self.action in {"list", "retrieve"}:
            return self.list_serializer_class
        return self.detail_serializer_class

    def get_queryset(self):
        """Return the queryset according to the action."""
        queryset = super().get_queryset()
        queryset = queryset.filter(team=self.kwargs["team_id"])

        if self.action in {"list", "retrieve"}:
            if query := self.request.GET.get("q", ""):
                queryset = queryset.filter(
                    Q(user__email__unaccent__icontains=query)
                    | Q(user__name__unaccent__icontains=query)
                )

            # Determine which role the logged-in user has in the team
            user_role_query = models.TeamAccess.objects.filter(
                user=self.request.user, team=self.kwargs["team_id"]
            ).values("role")[:1]

            queryset = (
                # The logged-in user should be part of a team to see its accesses
                queryset.filter(
                    team__accesses__user=self.request.user,
                )
                # Abilities are computed based on logged-in user's role and
                # the user role on each team access
                .annotate(
                    user_role=Subquery(user_role_query),
                )
                .select_related("user")
                .distinct()
            )
        return queryset

    def destroy(self, request, *args, **kwargs):
        """Forbid deleting the last owner access"""
        instance = self.get_object()
        team = instance.team

        # Check if the access being deleted is the last owner access for the team
        if instance.role == "owner" and team.accesses.filter(role="owner").count() == 1:
            return response.Response(
                {"detail": "Cannot delete the last owner access for the team."},
                status=400,
            )

        return super().destroy(request, *args, **kwargs)

    def perform_update(self, serializer):
        """Check that we don't change the role if it leads to losing the last owner."""
        instance = serializer.instance

        # Check if the role is being updated and the new role is not "owner"
        if (
            "role" in self.request.data
            and self.request.data["role"] != models.RoleChoices.OWNER
        ):
            team = instance.team
            # Check if the access being updated is the last owner access for the team
            if (
                instance.role == models.RoleChoices.OWNER
                and team.accesses.filter(role=models.RoleChoices.OWNER).count() == 1
            ):
                message = "Cannot change the role to a non-owner role for the last owner access."
                raise exceptions.ValidationError({"role": message})

        serializer.save()


class InvitationViewset(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """API ViewSet for user invitations to team.

    GET /api/v1.0/teams/<team_id>/invitations/:<invitation_id>/
        Return list of invitations related to that team or or one
        team access if an id is provided.

    POST /api/v1.0/teams/<team_id>/invitations/ with expected data:
        - email: str
        - role: str [owner|admin|member]
        - issuer : User, automatically added from user making query, if allowed
        - team : Team, automatically added from requested URI
        Return newly created invitation

    PUT / PATCH : Not permitted. Instead of updating your invitation,
        delete and create a new one.

    DELETE  /api/v1.0/teams/<team_id>/invitations/<invitation_id>/
        Delete targeted invitation
    """

    lookup_field = "id"
    pagination_class = Pagination
    permission_classes = [permissions.AccessPermission]
    queryset = (
        models.Invitation.objects.all().select_related("team").order_by("-created_at")
    )
    serializer_class = serializers.InvitationSerializer

    def get_permissions(self):
        """User only needs to be authenticated to list invitations"""
        if self.action == "list":
            permission_classes = [permissions.IsAuthenticated]
        else:
            return super().get_permissions()

        return [permission() for permission in permission_classes]

    def get_serializer_context(self):
        """Extra context provided to the serializer class."""
        context = super().get_serializer_context()
        context["team_id"] = self.kwargs["team_id"]
        return context

    def get_queryset(self):
        """Return the queryset according to the action."""
        queryset = super().get_queryset()
        queryset = queryset.filter(team=self.kwargs["team_id"])

        if self.action == "list":
            # Determine which role the logged-in user has in the team
            user_role_query = models.TeamAccess.objects.filter(
                user=self.request.user, team=self.kwargs["team_id"]
            ).values("role")[:1]

            queryset = (
                # The logged-in user should be part of a team to see its accesses
                queryset.filter(
                    team__accesses__user=self.request.user,
                )
                # Abilities are computed based on logged-in user's role and
                # the user role on each team access
                .annotate(user_role=Subquery(user_role_query))
                .distinct()
            )
        return queryset


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
 
