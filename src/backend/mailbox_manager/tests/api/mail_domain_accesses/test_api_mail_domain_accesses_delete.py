"""
Test for mail_domain accesses API endpoints in People's core app : delete
"""

import random

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from core import factories as core_factories

from mailbox_manager import enums, factories, models

pytestmark = pytest.mark.django_db


def test_api_mail_domain__accesses_delete_anonymous():
    """Anonymous users should not be allowed to destroy a mail_domain access."""
    access = factories.MailDomainAccessFactory()

    response = APIClient().delete(
        f"/api/v1.0/mail-domains/{access.domain.slug}/accesses/{access.id!s}/",
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert models.MailDomainAccess.objects.count() == 1


def test_api_mail_domain__accesses_delete_authenticated():
    """
    Authenticated users should not be allowed to delete a mail_domain access for a
    mail_domain to which they are not related.
    """
    user = core_factories.UserFactory()
    access = factories.MailDomainAccessFactory()

    client = APIClient()
    client.force_login(user)
    response = client.delete(
        f"/api/v1.0/mail-domains/{access.domain.slug}/accesses/{access.id!s}/",
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert models.MailDomainAccess.objects.count() == 1


def test_api_mail_domain__accesses_delete_member():
    """
    Authenticated users should not be allowed to delete a mail_domain access for a
    mail_domain in which they are a simple member.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory(
        users=[(user, enums.MailDomainRoleChoices.VIEWER)]
    )
    access = factories.MailDomainAccessFactory(domain=mail_domain)

    assert models.MailDomainAccess.objects.count() == 2
    assert models.MailDomainAccess.objects.filter(user=access.user).exists()

    client = APIClient()
    client.force_login(user)
    response = client.delete(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/{access.id!s}/",
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert models.MailDomainAccess.objects.count() == 2


def test_api_mail_domain__accesses_delete_administrators():
    """
    Users who are administrators in a mail_domain should be allowed to delete an access
    from the mail_domain provided it is not ownership.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory(
        users=[(user, enums.MailDomainRoleChoices.ADMIN)]
    )
    access = factories.MailDomainAccessFactory(
        domain=mail_domain,
        role=random.choice(
            [enums.MailDomainRoleChoices.VIEWER, enums.MailDomainRoleChoices.ADMIN]
        ),
    )

    assert models.MailDomainAccess.objects.count() == 2
    assert models.MailDomainAccess.objects.filter(user=access.user).exists()

    client = APIClient()
    client.force_login(user)
    response = client.delete(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/{access.id!s}/",
    )

    assert response.status_code == 204
    assert models.MailDomainAccess.objects.count() == 1


def test_api_mail_domain__accesses_delete_owners_except_owners():
    """
    Users should be able to delete the mail_domain access of another user
    for a mail_domain of which they are owner provided it is not an owner access.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory(
        users=[(user, enums.MailDomainRoleChoices.OWNER)]
    )
    access = factories.MailDomainAccessFactory(
        domain=mail_domain,
        role=random.choice(
            [enums.MailDomainRoleChoices.VIEWER, enums.MailDomainRoleChoices.ADMIN]
        ),
    )

    assert models.MailDomainAccess.objects.count() == 2
    assert models.MailDomainAccess.objects.filter(user=access.user).exists()

    client = APIClient()
    client.force_login(user)
    response = client.delete(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/{access.id!s}/",
    )

    assert response.status_code == 204
    assert models.MailDomainAccess.objects.count() == 1


def test_api_mail_domain__accesses_delete_owners_for_owners():
    """
    Users should not be allowed to delete the mail_domain access of another owner
    even for a mail_domain in which they are direct owner.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory(
        users=[(user, enums.MailDomainRoleChoices.OWNER)]
    )
    access = factories.MailDomainAccessFactory(
        domain=mail_domain, role=enums.MailDomainRoleChoices.OWNER
    )

    assert models.MailDomainAccess.objects.count() == 2
    assert models.MailDomainAccess.objects.filter(user=access.user).exists()

    client = APIClient()
    client.force_login(user)
    response = client.delete(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/{access.id!s}/",
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert models.MailDomainAccess.objects.count() == 2


def test_api_mail_domain__accesses_delete_owners_last_owner():
    """
    It should not be possible to delete the last owner access from a mail_domain
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory()
    access = factories.MailDomainAccessFactory(
        domain=mail_domain, user=user, role=enums.MailDomainRoleChoices.OWNER
    )
    assert models.MailDomainAccess.objects.count() == 1

    client = APIClient()
    client.force_login(user)

    response = client.delete(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/{access.id!s}/",
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert models.MailDomainAccess.objects.count() == 1
