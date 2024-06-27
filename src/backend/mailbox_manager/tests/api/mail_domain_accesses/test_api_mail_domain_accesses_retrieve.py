"""
Test for mail_domain accesses API endpoints in People's core app : retrieve
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from core import factories as core_factories

from mailbox_manager import factories

pytestmark = pytest.mark.django_db


def test_api_mail_domain__accesses_retrieve_anonymous():
    """
    Anonymous users should not be allowed to retrieve a mail_domain access.
    """
    access = factories.MailDomainAccessFactory()

    response = APIClient().get(
        f"/api/v1.0/mail-domains/{access.domain.slug}/accesses/{access.id!s}/",
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }


def test_api_mail_domain__accesses_retrieve_authenticated_unrelated():
    """
    Authenticated users should not be allowed to retrieve a mail_domain access for
    a mail_domain to which they are not related.
    """
    user = core_factories.UserFactory()
    access = factories.MailDomainAccessFactory(domain=factories.MailDomainFactory())

    client = APIClient()
    client.force_login(user)
    response = client.get(
        f"/api/v1.0/mail-domains/{access.domain.slug}/accesses/{access.id!s}/",
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "No MailDomainAccess matches the given query."}

    # Accesses related to another mail_domain should be excluded even if the user is related to it
    for other_access in [
        factories.MailDomainAccessFactory(),
        factories.MailDomainAccessFactory(user=user),
    ]:
        response = client.get(
            f"/api/v1.0/mail-domains/{access.domain.slug}/accesses/{other_access.id!s}/",
        )

        assert response.status_code == 404
        assert response.json() == {
            "detail": "No MailDomainAccess matches the given query."
        }


def test_api_mail_domain__accesses_retrieve_authenticated_related():
    """
    A user who is related to a mail_domain should be allowed to retrieve the
    associated mail_domain user accesses.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory()
    access = factories.MailDomainAccessFactory(domain=mail_domain, user=user)

    client = APIClient()
    client.force_login(user)
    response = client.get(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/{access.id!s}/",
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": str(access.id),
        "user": {
            "id": str(access.user.id),
            "email": str(user.email),
            "name": str(user.name),
        },
        "role": str(access.role),
        "abilities": access.get_abilities(user),
    }
