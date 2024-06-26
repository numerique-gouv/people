"""
Tests for MailDomains API endpoint in People's app mailbox_manager. Focus on "create" action.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from core import factories as core_factories

from mailbox_manager import factories, models

pytestmark = pytest.mark.django_db


def test_api_mail_domains__create_anonymous():
    """Anonymous users should not be allowed to create mail domains."""

    response = APIClient().post(
        "/api/v1.0/mail-domains/",
        {
            "name": "mydomain.com",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert not models.MailDomain.objects.exists()


def test_api_mail_domains__create_name_unique():
    """
    Creating domain should raise an error if already existing name.
    """
    factories.MailDomainFactory(name="existing_domain.com")
    user = core_factories.UserFactory()

    client = APIClient()
    client.force_login(user)

    response = client.post(
        "/api/v1.0/mail-domains/",
        {
            "name": "existing_domain.com",
        },
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["name"] == ["Mail domain with this name already exists."]


def test_api_mail_domains__create_authenticated():
    """
    Authenticated users should be able to create mail domains
    and should automatically be added as owner of the newly created domain.
    """

    user = core_factories.UserFactory()

    client = APIClient()
    client.force_login(user)

    response = client.post(
        "/api/v1.0/mail-domains/",
        {
            "name": "mydomain.com",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    domain = models.MailDomain.objects.get()
    assert domain.name == "mydomain.com"
    assert domain.accesses.filter(role="owner", user=user).exists()
