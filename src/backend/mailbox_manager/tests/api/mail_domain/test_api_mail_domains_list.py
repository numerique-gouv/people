"""
Tests for MailDomains API endpoint in People's mailbox manager app. Focus on "list" action.
"""

from unittest import mock

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from core import factories as core_factories
from core.api.viewsets import Pagination

from mailbox_manager import factories

pytestmark = pytest.mark.django_db


def test_api_mail_domains__list_anonymous():
    """Anonymous users should not be allowed to list mail domains."""

    factories.MailDomainFactory.create_batch(3)

    response = APIClient().get("/api/v1.0/mail-domains/")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }


def test_api_mail_domains__list_authenticated():
    """
    Authenticated users should be able to list domains
    to which they have access.
    """

    identity = core_factories.IdentityFactory()
    user = identity.user

    client = APIClient()
    client.force_login(user)

    expected_ids = {
        str(access.domain.id)
        for access in factories.MailDomainAccessFactory.create_batch(5, user=user)
    }
    factories.MailDomainFactory.create_batch(2)  # Other teams
    factories.MailDomainAccessFactory.create_batch(2)  # Other teams and accesses

    response = client.get(
        "/api/v1.0/mail-domains/",
    )

    assert response.status_code == status.HTTP_200_OK
    results = response.json()["results"]
    assert len(results) == 5
    results_id = {result["id"] for result in results}
    assert expected_ids == results_id


@mock.patch.object(Pagination, "get_page_size", return_value=3)
def test_api_mail_domains__list_pagination(
    _mock_page_size,
):
    """Pagination should work as expected."""
    identity = core_factories.IdentityFactory()
    user = identity.user

    client = APIClient()
    client.force_login(user)

    factories.MailDomainAccessFactory.create_batch(5, user=user)

    endpoint = "api/v1.0/mail-domains/"

    # Get page 1
    response = client.get(
        f"/{endpoint}",
    )

    assert response.status_code == status.HTTP_200_OK
    content = response.json()

    assert content["count"] == 5
    assert len(content["results"]) == 3
    assert content["next"] == f"http://testserver/{endpoint}?page=2"
    assert content["previous"] is None

    # Get page 2
    response = client.get(
        f"/{endpoint}?page=2",
    )

    assert response.status_code == status.HTTP_200_OK
    content = response.json()

    assert content["count"] == 5
    assert content["next"] is None
    assert content["previous"] == f"http://testserver/{endpoint}"

    assert len(content["results"]) == 2
