"""
Tests for Teams API endpoint in People's core app: create
"""

import pytest
from rest_framework.status import (
    HTTP_201_CREATED,
    HTTP_401_UNAUTHORIZED,
)
from rest_framework.test import APIClient

from core.factories import OrganizationFactory, UserFactory
from core.models import Team

pytestmark = pytest.mark.django_db


def test_api_teams_create_anonymous():
    """Anonymous users should not be allowed to create teams."""
    response = APIClient().post(
        "/api/v1.0/teams/",
        {
            "name": "my team",
        },
    )

    assert response.status_code == HTTP_401_UNAUTHORIZED
    assert not Team.objects.exists()


def test_api_teams_create_authenticated():
    """
    Authenticated users should be able to create teams and should automatically be declared
    as the owner of the newly created team.
    """
    organization = OrganizationFactory(with_registration_id=True)
    user = UserFactory(organization=organization)

    client = APIClient()
    client.force_login(user)

    response = client.post(
        "/api/v1.0/teams/",
        {
            "name": "my team",
        },
        format="json",
    )

    assert response.status_code == HTTP_201_CREATED
    team = Team.objects.get()
    assert team.name == "my team"
    assert team.organization == organization
    assert team.accesses.filter(role="owner", user=user).exists()


def test_api_teams_create_cannot_override_organization():
    """
    Authenticated users should be able to create teams and not
    be able to set the organization manually (for now).
    """
    organization = OrganizationFactory(with_registration_id=True)
    user = UserFactory(organization=organization)

    client = APIClient()
    client.force_login(user)

    response = client.post(
        "/api/v1.0/teams/",
        {
            "name": "my team",
            "organization": OrganizationFactory(
                with_registration_id=True
            ).pk,  # ignored
        },
        format="json",
    )

    assert response.status_code == HTTP_201_CREATED
    team = Team.objects.get()
    assert team.name == "my team"
    assert team.organization == organization
    assert team.accesses.filter(role="owner", user=user).exists()
