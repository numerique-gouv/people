"""API URL Configuration"""

from django.conf import settings
from django.urls import include, path, re_path

from rest_framework.routers import DefaultRouter

from core.api.viewsets.config import ConfigView
from core.api.viewsets.contacts import ContactViewSet
from core.api.viewsets.teams import InvitationViewset, TeamAccessViewSet, TeamViewSet
from core.api.viewsets.users import UserViewSet
from core.authentication.urls import urlpatterns as oidc_urls
from core.resource_server.urls import urlpatterns as resource_server_urls

# - Main endpoints
router = DefaultRouter()
router.register("contacts", ContactViewSet, basename="contacts")
router.register("teams", TeamViewSet, basename="teams")
router.register("users", UserViewSet, basename="users")

# - Routes nested under a team
team_related_router = DefaultRouter()
team_related_router.register(
    "accesses",
    TeamAccessViewSet,
    basename="team_accesses",
)

team_related_router.register(
    "invitations",
    InvitationViewset,
    basename="invitations",
)


urlpatterns = [
    path(
        f"api/{settings.API_VERSION}/",
        include(
            [
                *router.urls,
                *oidc_urls,
                *resource_server_urls,
                re_path(
                    r"^teams/(?P<team_id>[0-9a-z-]*)/",
                    include(team_related_router.urls),
                ),
            ]
        ),
    ),
    path(f"api/{settings.API_VERSION}/", include("mailbox_manager.urls")),
    path(f"api/{settings.API_VERSION}/config/", ConfigView.as_view()),
]
