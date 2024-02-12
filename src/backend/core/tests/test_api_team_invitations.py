"""
Unit tests for the Invitation model
"""
import pytest
from rest_framework import status
from rest_framework.test import APIClient

from core import factories
from core.api import serializers

from .utils import OIDCToken

pytestmark = pytest.mark.django_db


def test_api_team_invitations_anonymous():
    """Anonymous users should not be able to create invitations."""
    team = factories.TeamFactory()
    invitation_values = serializers.InvitationSerializer(
        factories.InvitationFactory.build()
    ).data

    response = APIClient().post(
        f"/api/v1.0/teams/{team.id}/invitations/",
        invitation_values,
        format="json",
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }


def test_api_team_invitations_authenticated_outsider():
    """Users outside of team should not be permitted to invite to team."""
    identity = factories.IdentityFactory()
    jwt_token = OIDCToken.for_user(identity.user)

    team = factories.TeamFactory()  # user not in team
    invitation_values = serializers.InvitationSerializer(
        factories.InvitationFactory.build()
    ).data

    response = APIClient().post(
        f"/api/v1.0/teams/{team.id}/invitations/",
        invitation_values,
        format="json",
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.parametrize(
    "parameters",
    [
        ("owner", status.HTTP_201_CREATED),
        ("administrator", status.HTTP_201_CREATED),
        ("member", status.HTTP_403_FORBIDDEN),
    ],
)
def test_api_team_invitations_team_members(parameters):
    """
    Owners and administrators should be able to invite new members.
    Simple members however, should not.
    """
    identity = factories.IdentityFactory()
    jwt_token = OIDCToken.for_user(identity.user)

    team = factories.TeamFactory(users=[(identity.user, parameters[0])])
    invitation_values = serializers.InvitationSerializer(
        factories.InvitationFactory.build()
    ).data

    response = APIClient().post(
        f"/api/v1.0/teams/{team.id}/invitations/",
        invitation_values,
        format="json",
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )
    assert response.status_code == parameters[1]


def test_invitation_issuer_and_team_automatically_added():
    """Team and issuer fields should auto-complete."""
    identity = factories.IdentityFactory()
    jwt_token = OIDCToken.for_user(identity.user)

    team = factories.TeamFactory(users=[(identity.user, "owner")])
    invitation_values = serializers.InvitationSerializer(
        factories.InvitationFactory.build()
    ).data

    response = APIClient().post(
        f"/api/v1.0/teams/{team.id}/invitations/",
        invitation_values,
        format="json",
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )
    assert response.status_code == status.HTTP_201_CREATED
    # team and issuer automatically set
    assert response.json()["team"] == str(team.id)
    assert response.json()["issuer"] == str(identity.user.id)


def test_api_team_invitations_cannot_duplicate_invitation():
    """An email should not be invited multiple times to the same team."""
    existing_invitation = factories.InvitationFactory()
    team = existing_invitation.team

    identity = factories.IdentityFactory()
    jwt_token = OIDCToken.for_user(identity.user)

    factories.TeamAccessFactory(team=team, user=identity.user, role="administrator")
    invitation_values = serializers.InvitationSerializer(existing_invitation).data

    response = APIClient().post(
        f"/api/v1.0/teams/{team.id}/invitations/",
        invitation_values,
        format="json",
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["__all__"] == [
        "Invitation with this Email address and Team already exists."
    ]
