"""
Tests for MailDomains API endpoint in People's mailbox manager app. Focus on "list" action.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from core import factories as core_factories
from core import models as core_models

from mailbox_manager import enums, factories

pytestmark = pytest.mark.django_db


def test_api_mail_domains__available_users_anonymous():
    """Anonymous users should not be allowed to list users."""

    maildomain = factories.MailDomainFactory()

    response = APIClient().get(
        f"/api/v1.0/mail-domains/{maildomain.slug}/accesses/users/"
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }


def test_api_mail_domains__list_available_users__authenticated():
    """Authenticated users should be allowed to list available users for a domain."""
    authenticated_user = core_factories.UserFactory()
    client = APIClient()
    client.force_login(authenticated_user)

    dave = core_factories.UserFactory(email="bowbow@example.com", name="David Bowman")
    nicole = core_factories.UserFactory(
        email="nicole_foole@example.com", name="Nicole Foole"
    )
    frank = core_factories.UserFactory(
        email="frank_poole@example.com", name="Frank Poole"
    )
    mary = core_factories.UserFactory(email="mary_pol@example.com", name="Mary Pol")

    expected_ids = {str(user.id) for user in core_models.User.objects.all()}

    maildomain = factories.MailDomainFactory()
    factories.MailDomainAccessFactory(
        user__name="Owen Theowner",
        domain=maildomain,
        role=enums.MailDomainRoleChoices.OWNER,
    )
    factories.MailDomainAccessFactory(
        user__name="Anna Theadmin",
        domain=maildomain,
        role=enums.MailDomainRoleChoices.ADMIN,
    )
    factories.MailDomainAccessFactory(
        user__name="Victor Theviewer",
        domain=maildomain,
        role=enums.MailDomainRoleChoices.VIEWER,
    )

    response = client.get(f"/api/v1.0/mail-domains/{maildomain.slug}/accesses/users/")
    assert response.status_code == status.HTTP_200_OK

    results = response.json()
    assert len(results) == 5
    results_id = {result["id"] for result in results}
    assert expected_ids == results_id

    # now test filter user
    response = client.get(
        f"/api/v1.0/mail-domains/{maildomain.slug}/accesses/users/?q=OL"
    )
    assert response.status_code == status.HTTP_200_OK
    expected_ids = {str(user.id) for user in [nicole, frank, mary]}
    results = response.json()
    assert len(results) == 3
    results_id = {result["id"] for result in results}
    assert expected_ids == results_id

    # filter on email info
    response = client.get(
        f"/api/v1.0/mail-domains/{maildomain.slug}/accesses/users/?q=bowbow"
    )
    assert response.status_code == status.HTTP_200_OK
    results = response.json()
    assert len(results) == 1
    assert results[0]["id"] == str(dave.id)
