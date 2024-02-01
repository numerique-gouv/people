"""
Tests for Teams API endpoint in People's core app: create
"""
import pytest
from rest_framework.test import APIClient

from core.factories import IdentityFactory, TeamFactory
from core.models import Team
from core.tests.utils import OIDCToken

pytestmark = pytest.mark.django_db


def test_api_teams_create_anonymous():
    """Anonymous users should not be allowed to create teams."""
    response = APIClient().post(
        "/api/v1.0/teams/",
        {
            "name": "my team",
        },
    )

    assert response.status_code == 401
    assert not Team.objects.exists()


def test_api_teams_create_authenticated():
    """
    Authenticated users should be able to create teams and should automatically be declared
    as the owner of the newly created team.
    """
    identity = IdentityFactory()
    user = identity.user
    jwt_token = OIDCToken.for_user(user)

    response = APIClient().post(
        "/api/v1.0/teams/",
        {
            "name": "my team",
        },
        format="json",
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )

    assert response.status_code == 201
    team = Team.objects.get()
    assert team.name == "my team"
    assert team.accesses.filter(role="owner", user=user).exists()


def test_api_teams_create_authenticated_slugify_name():
    """
    Creating teams should automatically generate a slug.
    """
    identity = IdentityFactory()
    jwt_token = OIDCToken.for_user(identity.user)

    response = APIClient().post(
        "/api/v1.0/teams/",
        {"name": "my team"},
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )

    assert response.status_code == 201
    team = Team.objects.get()
    assert team.name == "my team"
    assert team.slug == "my-team"


@pytest.mark.parametrize(
    "param",
    [
        ("my team", "my-team"),
        ("my     team", "my-team"),
        ("MY TEAM TOO", "my-team-too"),
        ("mon équipe", "mon-equipe"),
        ("front devs & UX", "front-devs-ux"),
    ],
)
def test_api_teams_create_authenticated_expected_slug(param):
    """
    Creating teams should automatically create unaccented, no unicode, lower-case slug.
    """
    identity = IdentityFactory()
    jwt_token = OIDCToken.for_user(identity.user)

    response = APIClient().post(
        "/api/v1.0/teams/",
        {
            "name": param[0],
        },
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )

    assert response.status_code == 201
    team = Team.objects.get()
    assert team.name == param[0]
    assert team.slug == param[1]


def test_api_teams_create_authenticated_unique_slugs():
    """
    Creating teams should raise an error if already existing slug.
    """
    TeamFactory(name="existing team")
    identity = IdentityFactory()
    jwt_token = OIDCToken.for_user(identity.user)

    response = APIClient().post(
        "/api/v1.0/teams/",
        {
            "name": "èxisting team",
        },
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )

    assert response.status_code == 400
    assert response.json()["slug"] == ["Team with this Slug already exists."]
