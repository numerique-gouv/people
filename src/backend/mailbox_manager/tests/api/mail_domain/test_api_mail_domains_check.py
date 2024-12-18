"""
Tests for MailDomains API endpoint in People's app mailbox_manager. Focus on "check" action.
"""

import re

import pytest
import responses
from rest_framework import status
from rest_framework.test import APIClient

from core import factories as core_factories

from mailbox_manager import enums, factories
from mailbox_manager.utils.dimail import DimailAPIClient

client = DimailAPIClient()

pytestmark = pytest.mark.django_db


@pytest.fixture
def user():
    """Create an user"""
    user = core_factories.UserFactory()
    user.sub = "604cd841-4596-43c8-8d35-34018b25086b"
    user.save()
    return user


@pytest.fixture
def domain():
    """Create an enabled domain"""
    return factories.MailDomainFactory(name="test.domain.com", status="enabled")


def test_api_mail_domains__check_anonymous(domain):
    """Anonymous user cannot request a domain check."""

    with responses.RequestsMock() as rsps:
        # no call expected
        response = APIClient().get(
            f"/api/v1.0/mail-domains/{domain.slug}/check/",
            format="json",
        )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_api_mail_domains__check_unrelated(user, domain):
    """User not related to a domain cannot request a domain check."""

    client = APIClient()
    client.force_login(user)

    with responses.RequestsMock() as rsps:
        # no call expected
        response = client.get(
            f"/api/v1.0/mail-domains/{domain.slug}/check/",
            format="json",
        )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_api_mail_domains__check_domain_viewer(user, domain):
    """Domain viewer should not be able to request a domain check."""

    factories.MailDomainAccessFactory(
        user=user, domain=domain, role=enums.MailDomainRoleChoices.VIEWER
    )

    client = APIClient()
    client.force_login(user)

    with responses.RequestsMock() as rsps:
        # no call expected
        response = client.get(
            f"/api/v1.0/mail-domains/{domain.slug}/check/",
            format="json",
        )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_api_mail_domains__check_domain_admin(user, domain):
    """Domain admin should be able to request a domain check."""

    factories.MailDomainAccessFactory(
        user=user, domain=domain, role=enums.MailDomainRoleChoices.ADMIN
    )

    client = APIClient()
    client.force_login(user)

    with responses.RequestsMock() as rsps:
        rsps.add(
            rsps.GET,
            re.compile(rf".*/domains/{domain.name}/check/"),
            body='{"access_token": "dimail_people_token"}',
            status=status.HTTP_200_OK,
            content_type="application/json",
        )
        response = client.get(f"/api/v1.0/mail-domains/{domain.slug}/check/")

    assert response.status_code == status.HTTP_200_OK


def test_api_mail_domains__check_broken_domain_changes_status(user, domain):
    """If a returning domain check marks the domain as 'broken', we set it to 'failed' in our database."""
    pass