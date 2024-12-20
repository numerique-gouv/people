"""
Tests for Teams API endpoint in People's core app: list
"""

import pytest
from rest_framework.status import HTTP_200_OK, HTTP_401_UNAUTHORIZED
from rest_framework.test import APIClient

from core import factories

pytestmark = pytest.mark.django_db


def test_api_teams_list_anonymous():
    """Anonymous users should not be allowed to list teams."""
    factories.TeamFactory.create_batch(2)

    response = APIClient().get("/api/v1.0/teams/")

    assert response.status_code == HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }


def test_api_teams_list_authenticated():
    """
    Authenticated users should be able to list teams
    they are an owner/administrator/member of.
    """
    user = factories.UserFactory()

    client = APIClient()
    client.force_login(user)

    expected_ids = {
        str(access.team.id)
        for access in factories.TeamAccessFactory.create_batch(5, user=user)
    }
    factories.TeamFactory.create_batch(2)  # Other teams

    response = client.get(
        "/api/v1.0/teams/",
    )

    assert response.status_code == HTTP_200_OK
    results = response.json()

    assert len(results) == 5
    results_id = {result["id"] for result in results}
    assert expected_ids == results_id


def test_api_teams_list_authenticated_distinct():
    """A team with several related users should only be listed once."""
    user = factories.UserFactory()

    client = APIClient()
    client.force_login(user)

    other_user = factories.UserFactory()

    team = factories.TeamFactory(users=[user, other_user])

    response = client.get(
        "/api/v1.0/teams/",
    )

    assert response.status_code == HTTP_200_OK
    content = response.json()
    assert len(content) == 1
    assert content[0]["id"] == str(team.id)


def test_api_teams_order():
    """
    Test that the endpoint GET teams is sorted in 'created_at' descending order by default.
    """
    user = factories.UserFactory()

    client = APIClient()
    client.force_login(user)

    team_ids = [
        str(team.id) for team in factories.TeamFactory.create_batch(5, users=[user])
    ]

    response = client.get(
        "/api/v1.0/teams/",
    )

    assert response.status_code == 200

    response_data = response.json()
    response_team_ids = [team["id"] for team in response_data]

    team_ids.reverse()
    assert (
        response_team_ids == team_ids
    ), "created_at values are not sorted from newest to oldest"


def test_api_teams_order_param():
    """
    Test that the 'created_at' field is sorted in ascending order
    when the 'ordering' query parameter is set.
    """
    user = factories.UserFactory()

    client = APIClient()
    client.force_login(user)

    team_ids = [
        str(team.id) for team in factories.TeamFactory.create_batch(5, users=[user])
    ]

    response = client.get(
        "/api/v1.0/teams/?ordering=created_at",
    )
    assert response.status_code == 200

    response_data = response.json()
    response_team_ids = [team["id"] for team in response_data]

    assert (
        response_team_ids == team_ids
    ), "created_at values are not sorted from oldest to newest"
