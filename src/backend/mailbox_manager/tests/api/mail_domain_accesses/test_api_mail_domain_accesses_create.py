"""
Test for mail_domain accesses API endpoints in People's core app : create
"""

import random

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from core import factories as core_factories

from mailbox_manager import enums, factories, models

pytestmark = pytest.mark.django_db


def test_api_mail_domain__accesses_create_anonymous():
    """Anonymous users should not be allowed to create mail domain accesses."""
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory()
    response = APIClient().post(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/",
        {
            "user": str(user.id),
            "mail_domain": str(mail_domain.id),
            "role": random.choice(enums.MailDomainRoleChoices.choices)[0],
        },
        format="json",
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }
    assert models.MailDomainAccess.objects.exists() is False


def test_api_mail_domain__accesses_create_authenticated_unrelated():
    """
    Authenticated users should not be allowed to create domain accesses for a domain to
    which they are not related.
    """
    user = core_factories.UserFactory()
    other_user = core_factories.UserFactory()
    domain = factories.MailDomainFactory()

    client = APIClient()
    client.force_login(user)
    response = client.post(
        f"/api/v1.0/mail-domains/{domain.slug}/accesses/",
        {
            "user": str(other_user.id),
        },
        format="json",
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {
        "detail": "You are not allowed to manage accesses for this domain."
    }
    assert not models.MailDomainAccess.objects.filter(user=other_user).exists()


def test_api_mail_domain__accesses_create_authenticated_member():
    """Members of a mail domain should not be allowed to create mail domain accesses."""
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory(
        users=[(user, enums.MailDomainRoleChoices.VIEWER)]
    )
    other_user = core_factories.UserFactory()

    client = APIClient()
    client.force_login(user)
    for role in [role[0] for role in enums.MailDomainRoleChoices.choices]:
        response = client.post(
            f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/",
            {
                "user": str(other_user.id),
                "role": role,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert response.json() == {
            "detail": "You are not allowed to manage accesses for this domain."
        }

    assert not models.MailDomainAccess.objects.filter(user=other_user).exists()


def test_api_mail_domain__accesses_create_authenticated_administrator():
    """
    Administrators of a domain should be able to create mail domain accesses
    except for the "owner" role.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory(
        users=[(user, enums.MailDomainRoleChoices.ADMIN)]
    )
    other_user = core_factories.UserFactory()

    client = APIClient()
    client.force_login(user)

    # It should not be allowed to create an owner access
    response = client.post(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/",
        {
            "user": str(other_user.id),
            "role": "owner",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {
        "detail": "Only owners of a domain can assign other users as owners."
    }

    # It should be allowed to create a lower access
    role = random.choice(
        [
            role[0]
            for role in enums.MailDomainRoleChoices.choices
            if role[0] != enums.MailDomainRoleChoices.OWNER
        ]
    )

    response = client.post(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/",
        {
            "user": str(other_user.id),
            "role": role,
        },
        format="json",
    )

    assert response.status_code == 201
    assert models.MailDomainAccess.objects.filter(user=other_user).count() == 1
    new_mail_domain_access = models.MailDomainAccess.objects.filter(
        user=other_user
    ).get()
    assert response.json() == {
        "abilities": new_mail_domain_access.get_abilities(user),
        "id": str(new_mail_domain_access.id),
        "role": role,
        "user": str(other_user.id),
    }


def test_api_mail_domain__accesses_create_authenticated_owner():
    """
    Owners of a mail domain should be able to create mail domain accesses whatever the role.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory(
        users=[(user, enums.MailDomainRoleChoices.OWNER)]
    )
    other_user = core_factories.UserFactory()

    role = random.choice([role[0] for role in enums.MailDomainRoleChoices.choices])

    client = APIClient()
    client.force_login(user)
    response = client.post(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/",
        {
            "user": str(other_user.id),
            "role": role,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert models.MailDomainAccess.objects.filter(user=other_user).count() == 1
    new_mail_domain_access = models.MailDomainAccess.objects.filter(
        user=other_user
    ).get()
    assert response.json() == {
        "abilities": new_mail_domain_access.get_abilities(user),
        "id": str(new_mail_domain_access.id),
        "role": role,
        "user": str(other_user.id),
    }
