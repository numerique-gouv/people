"""
Tests for Teams API endpoint in People's core app: retrieve
"""

import pytest
from rest_framework import status
from rest_framework.status import HTTP_404_NOT_FOUND
from rest_framework.test import APIClient

from core import factories
from core.factories import UserFactory

pytestmark = pytest.mark.django_db


def test_api_teams_retrieve_anonymous():
    """Anonymous users should not be allowed to retrieve a team."""
    team = factories.TeamFactory()
    response = APIClient().get(f"/resource-server/v1.0/teams/{team.id}/")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }


def test_api_teams_retrieve_authenticated_unrelated(
    client, force_login_via_resource_server
):
    """
    Authenticated users should not be allowed to retrieve a team to which they are
    not related.
    """
    user = factories.UserFactory()
    service_provider = factories.ServiceProviderFactory()

    team = factories.TeamFactory(service_providers=[service_provider])

    with force_login_via_resource_server(client, user, service_provider.audience_id):
        response = client.get(
            f"/resource-server/v1.0/teams/{team.id!s}/",
        )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {"detail": "No Team matches the given query."}


def test_api_teams_retrieve_authenticated_related(
    client, force_login_via_resource_server
):
    """
    Authenticated users should be allowed to retrieve a team to which they
    are related whatever the role even if the request is authenticated via
    a resource server.
    """
    service_provider = factories.ServiceProviderFactory(
        audience_id="some_service_provider"
    )
    user = factories.UserFactory()
    team = factories.TeamFactory(users=[user], service_providers=[service_provider])

    with force_login_via_resource_server(client, user, service_provider.audience_id):
        response = client.get(
            f"/resource-server/v1.0/teams/{team.id!s}/",
            HTTP_AUTHORIZATION="Bearer b64untestedbearertoken",
        )

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "id": str(team.id),
        "name": team.name,
        "created_at": team.created_at.isoformat().replace("+00:00", "Z"),
        "updated_at": team.updated_at.isoformat().replace("+00:00", "Z"),
    }


def test_api_teams_retrieve_authenticated_other_service_provider(
    client, force_login_via_resource_server
):
    """
    Authenticated users should not be able to retrieve a team
    if the request is authenticated via a different resource server.
    """
    user = UserFactory()
    service_provider = factories.ServiceProviderFactory()

    other_service_provider = factories.ServiceProviderFactory(
        audience_id="some_service_provider"
    )
    team = factories.TeamFactory(
        users=[user], service_providers=[other_service_provider]
    )

    with force_login_via_resource_server(client, user, service_provider.audience_id):
        response = client.get(
            f"/resource-server/v1.0/teams/{team.id!s}/",
            HTTP_AUTHORIZATION="Bearer b64untestedbearertoken",
        )

    assert response.status_code == HTTP_404_NOT_FOUND
