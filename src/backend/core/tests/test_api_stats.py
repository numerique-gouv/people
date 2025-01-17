"""
Test stats endpoint
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from core import factories as core_factories

from mailbox_manager import factories as domains_factories
from mailbox_manager import models as domains_models

pytestmark = pytest.mark.django_db


def test_api_stats__anonymous():
    """Stats endpoint should be available even when not connected."""

    response = APIClient().get("/api/v1.0/stats/")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "total_users": 0,
        "mau": 0,
        "domains": 0,
        "mailboxes": 0,
        "teams": 0,
    }


def test_api_stats__expected_count():
    """Objects should be correctly counted."""

    core_factories.UserFactory.create_batch(4)
    logged_in_users = core_factories.UserFactory.create_batch(6)
    client = APIClient()
    for user in logged_in_users:
        client.force_login(user)

    core_factories.TeamFactory.create_batch(3)
    domains_factories.MailDomainFactory.create_batch(2)
    domains_factories.MailboxFactory.create_batch(
        10, domain=domains_models.MailDomain.objects.all()[1]
    )

    response = APIClient().get("/api/v1.0/stats/")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "total_users": 10,
        "mau": 6,
        "domains": 2,
        "mailboxes": 10,
        "teams": 3,
    }
