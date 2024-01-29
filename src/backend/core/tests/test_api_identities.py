"""
Test users API endpoints in the People core app.
"""
import pytest
from rest_framework.status import HTTP_200_OK, HTTP_401_UNAUTHORIZED
from rest_framework.test import APIClient

from core import factories

from .utils import OIDCToken

pytestmark = pytest.mark.django_db


def test_api_identities_list_anonymous():
    """Anonymous users should not be allowed to list identities."""
    response = APIClient().get("/api/v1.0/users/")
    assert response.status_code == HTTP_401_UNAUTHORIZED
    assert "Authentication credentials were not provided." in response.content.decode(
        "utf-8"
    )


def test_api_identities_list_authenticated():
    """
    Authenticated users should be able to list all identities.
    """
    user = factories.UserFactory(email="tester@ministry.fr")
    factories.IdentityFactory(user=user, email=user.email)
    jwt_token = OIDCToken.for_user(user)

    factories.IdentityFactory.create_batch(2)
    response = APIClient().get(
        "/api/v1.0/identities/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
    )
    assert response.status_code == HTTP_200_OK
    assert len(response.json()["results"]) == 3


def test_api_identities_authenticated_list_by_email():
    """
    Authenticated users should be able to search identities with a case-insensitive and
    partial query on the email.
    """
    user = factories.UserFactory(email="tester@ministry.fr")
    factories.IdentityFactory(user=user, email=user.email)
    jwt_token = OIDCToken.for_user(user)

    dave = factories.IdentityFactory(email="david.bowman@work.com")
    nicole = factories.IdentityFactory(email="nicole_foole@work.com")
    frank = factories.IdentityFactory(email="frank_poole@work.com")
    factories.IdentityFactory(email="heywood_floyd@work.com")

    # Full query should work
    response = APIClient().get(
        "/api/v1.0/identities/?q=david.bowman@work.com",
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )

    assert response.status_code == HTTP_200_OK
    identities = [identity["sub"] for identity in response.json()["results"]]
    assert identities[0] == str(dave.sub)

    # Partial query should work
    response = APIClient().get(
        "/api/v1.0/identities/?q=fran", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
    )

    assert response.status_code == HTTP_200_OK
    identities = [identity["sub"] for identity in response.json()["results"]]
    assert identities[0] == str(frank.sub)

    # Result that matches a trigram twice ranks better than result that matches once
    response = APIClient().get(
        "/api/v1.0/identities/?q=ole", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
    )

    assert response.status_code == HTTP_200_OK
    identities = [identity["sub"] for identity in response.json()["results"]]
    # "Nicole Foole" matches twice on "ole"
    assert identities == [str(nicole.sub), str(frank.sub)]

    # Even with a low similarity threshold, query should match expected emails
    response = APIClient().get(
        "/api/v1.0/identities/?q=ool", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
    )

    assert response.status_code == HTTP_200_OK
    identities = [identity["sub"] for identity in response.json()["results"]]
    assert identities == [str(nicole.sub), str(frank.sub)]


def test_api_users_authenticated_list_uppercase_content():
    """Upper case content should be found by lower case query."""
    user = factories.UserFactory(email="tester@ministry.fr")
    factories.IdentityFactory(user=user, email=user.email)
    jwt_token = OIDCToken.for_user(user)

    dave = factories.IdentityFactory(email="DAVID.BOWMAN@INTENSEWORK.COM")

    # Lowercase full query should work
    response = APIClient().get(
        "/api/v1.0/identities/?q=david.bowman@intensework.com",
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )

    assert response.status_code == HTTP_200_OK
    identities = [identity["sub"] for identity in response.json()["results"]]
    assert identities[0] == str(dave.sub)

    # Lowercase partial query should work
    response = APIClient().get(
        "/api/v1.0/identities/?q=david", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
    )

    assert response.status_code == HTTP_200_OK
    identities = [identity["sub"] for identity in response.json()["results"]]
    assert identities[0] == str(dave.sub)


def test_api_identities_list_authenticated_capital_query():
    """Upper case query should find lower case content."""
    user = factories.UserFactory(email="tester@ministry.fr")
    factories.IdentityFactory(user=user, email=user.email)
    jwt_token = OIDCToken.for_user(user)

    dave = factories.IdentityFactory(email="david.bowman@work.com")

    # Uppercase full query should work
    response = APIClient().get(
        "/api/v1.0/identities/?q=DAVID.BOWMAN@WORK.COM",
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )

    assert response.status_code == HTTP_200_OK
    identities = [identity["sub"] for identity in response.json()["results"]]
    assert identities[0] == str(dave.sub)

    # Uppercase partial query should work
    response = APIClient().get(
        "/api/v1.0/identities/?q=DAVID", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
    )

    assert response.status_code == HTTP_200_OK
    identities = [identity["sub"] for identity in response.json()["results"]]
    assert identities[0] == str(dave.sub)


def test_api_identities_list_authenticated_accented_query():
    """Accented query should find unaccented query."""
    user = factories.UserFactory(email="tester@ministry.fr")
    factories.IdentityFactory(user=user, email=user.email)
    jwt_token = OIDCToken.for_user(user)

    helene = factories.IdentityFactory(email="helene.bowman@work.com")

    # Accented full query
    response = APIClient().get(
        "/api/v1.0/identities/?q=hélène.bowman@work.com",
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )

    assert response.status_code == HTTP_200_OK
    identities = [identity["sub"] for identity in response.json()["results"]]
    assert identities[0] == str(helene.sub)

    # Accented partial email
    response = APIClient().get(
        "/api/v1.0/identities/?q=hélène", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
    )

    assert response.status_code == HTTP_200_OK
    identities = [identity["sub"] for identity in response.json()["results"]]
    assert identities[0] == str(helene.sub)
