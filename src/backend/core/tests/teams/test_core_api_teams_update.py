"""
Tests for Teams API endpoint in People's core app: update
"""

import random

import pytest
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
)
from rest_framework.test import APIClient

from core import factories
from core.api import serializers

pytestmark = pytest.mark.django_db


def test_api_teams_update_anonymous():
    """Anonymous users should not be allowed to update a team."""
    team = factories.TeamFactory()
    old_team_values = serializers.TeamSerializer(instance=team).data

    new_team_values = serializers.TeamSerializer(instance=factories.TeamFactory()).data
    response = APIClient().put(
        f"/api/v1.0/teams/{team.id!s}/",
        new_team_values,
        format="json",
    )
    assert response.status_code == HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }

    team.refresh_from_db()
    team_values = serializers.TeamSerializer(instance=team).data
    assert team_values == old_team_values


def test_api_teams_update_authenticated_unrelated():
    """
    Authenticated users should not be allowed to update a team to which they are not related.
    """
    user = factories.UserFactory()

    client = APIClient()
    client.force_login(user)

    team = factories.TeamFactory()
    old_team_values = serializers.TeamSerializer(instance=team).data

    new_team_values = serializers.TeamSerializer(instance=factories.TeamFactory()).data
    response = client.put(
        f"/api/v1.0/teams/{team.id!s}/",
        new_team_values,
        format="json",
    )

    assert response.status_code == HTTP_404_NOT_FOUND
    assert response.json() == {"detail": "No Team matches the given query."}

    team.refresh_from_db()
    team_values = serializers.TeamSerializer(instance=team).data
    assert team_values == old_team_values


def test_api_teams_update_authenticated_members():
    """
    Users who are members of a team but not administrators should
    not be allowed to update it.
    """
    user = factories.UserFactory()

    client = APIClient()
    client.force_login(user)

    team = factories.TeamFactory(users=[(user, "member")])
    old_team_values = serializers.TeamSerializer(instance=team).data

    new_team_values = serializers.TeamSerializer(instance=factories.TeamFactory()).data
    response = client.put(
        f"/api/v1.0/teams/{team.id!s}/",
        new_team_values,
        format="json",
    )

    assert response.status_code == HTTP_403_FORBIDDEN
    assert response.json() == {
        "detail": "You do not have permission to perform this action."
    }

    team.refresh_from_db()
    team_values = serializers.TeamSerializer(instance=team).data
    assert team_values == old_team_values


def test_api_teams_update_authenticated_administrators():
    """Administrators of a team should be allowed to update it."""
    user = factories.UserFactory()

    client = APIClient()
    client.force_login(user)

    team = factories.TeamFactory(users=[(user, "administrator")])
    initial_values = serializers.TeamSerializer(instance=team).data

    # generate new random values
    new_values = serializers.TeamSerializer(instance=factories.TeamFactory.build()).data
    response = client.put(
        f"/api/v1.0/teams/{team.id!s}/",
        new_values,
        format="json",
    )
    assert response.status_code == HTTP_200_OK

    team.refresh_from_db()
    final_values = serializers.TeamSerializer(instance=team).data
    for key, value in final_values.items():
        if key in ["id", "accesses", "created_at"]:
            assert value == initial_values[key]
        elif key == "updated_at":
            assert value > initial_values[key]
        else:
            # name and abilities successfully modified
            assert value == new_values[key]


def test_api_teams_update_authenticated_owners():
    """Administrators of a team should be allowed to update it,
    apart from read-only fields."""
    user = factories.UserFactory()

    client = APIClient()
    client.force_login(user)

    team = factories.TeamFactory(users=[(user, "owner")])
    old_team_values = serializers.TeamSerializer(instance=team).data

    new_team_values = serializers.TeamSerializer(
        instance=factories.TeamFactory.build()
    ).data
    response = client.put(
        f"/api/v1.0/teams/{team.id!s}/",
        new_team_values,
        format="json",
    )
    assert response.status_code == HTTP_200_OK

    team.refresh_from_db()
    team_values = serializers.TeamSerializer(instance=team).data
    for key, value in team_values.items():
        if key in ["id", "accesses", "created_at"]:
            assert value == old_team_values[key]
        elif key == "updated_at":
            assert value > old_team_values[key]
        else:
            # name and abilities successfully modified
            assert value == new_team_values[key]


def test_api_teams_update_administrator_or_owner_of_another():
    """
    Being administrator or owner of a team should not grant authorization to update
    another team.
    """
    user = factories.UserFactory()

    client = APIClient()
    client.force_login(user)

    factories.TeamFactory(users=[(user, random.choice(["administrator", "owner"]))])
    team = factories.TeamFactory(name="Old name")
    old_team_values = serializers.TeamSerializer(instance=team).data

    new_team_values = serializers.TeamSerializer(instance=factories.TeamFactory()).data
    response = client.put(
        f"/api/v1.0/teams/{team.id!s}/",
        new_team_values,
        format="json",
    )

    assert response.status_code == HTTP_404_NOT_FOUND
    assert response.json() == {"detail": "No Team matches the given query."}

    team.refresh_from_db()
    team_values = serializers.TeamSerializer(instance=team).data
    assert team_values == old_team_values
