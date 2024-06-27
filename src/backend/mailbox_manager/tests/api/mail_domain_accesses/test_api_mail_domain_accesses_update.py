"""
Test for mail_domain accesses API endpoints in People's core app : update
"""

import random
from uuid import uuid4

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from core import factories as core_factories

from mailbox_manager import enums, factories
from mailbox_manager.api import serializers

pytestmark = pytest.mark.django_db


def test_api_mail_domain__accesses_update_anonymous():
    """Anonymous users should not be allowed to update a mail_domain access."""
    access = factories.MailDomainAccessFactory()
    old_values = serializers.MailDomainAccessSerializer(instance=access).data

    new_values = {
        "id": uuid4(),
        "user": core_factories.UserFactory().id,
        "role": random.choice(enums.MailDomainRoleChoices.choices)[0],
    }

    for field, value in new_values.items():
        response = APIClient().put(
            f"/api/v1.0/mail-domains/{access.domain.slug}/accesses/{access.id!s}/",
            {**old_values, field: value},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    access.refresh_from_db()
    updated_values = serializers.MailDomainAccessSerializer(instance=access).data
    assert updated_values == old_values


def test_api_mail_domain__accesses_update_authenticated_unrelated():
    """
    Authenticated users should not be allowed to update a mail_domain access
    for a mail_domain to which they are not related.
    """
    user = core_factories.UserFactory()
    access = factories.MailDomainAccessFactory()
    old_values = serializers.MailDomainAccessSerializer(instance=access).data

    new_values = {
        "id": uuid4(),
        "user": core_factories.UserFactory().id,
        "role": random.choice(enums.MailDomainRoleChoices.choices)[0],
    }

    client = APIClient()
    client.force_login(user)
    for field, value in new_values.items():
        response = client.put(
            f"/api/v1.0/mail-domains/{access.domain.slug}/accesses/{access.id!s}/",
            {**old_values, field: value},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    access.refresh_from_db()
    updated_values = serializers.MailDomainAccessSerializer(instance=access).data
    assert updated_values == old_values


def test_api_mail_domain__accesses_update_authenticated_viewer():
    """Members of a mail_domain should not be allowed to update its accesses."""
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory(
        users=[(user, enums.MailDomainRoleChoices.VIEWER)]
    )
    access = factories.MailDomainAccessFactory(domain=mail_domain)
    old_values = serializers.MailDomainAccessSerializer(instance=access).data

    new_values = {
        "id": uuid4(),
        "user": core_factories.UserFactory().id,
        "role": random.choice(enums.MailDomainRoleChoices.choices)[0],
    }

    client = APIClient()
    client.force_login(user)
    for field, value in new_values.items():
        response = client.put(
            f"/api/v1.0/mail-domains/{access.domain.slug}/accesses/{access.id!s}/",
            {**old_values, field: value},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    access.refresh_from_db()
    updated_values = serializers.MailDomainAccessSerializer(instance=access).data
    assert updated_values == old_values


def test_api_mail_domain__accesses_update_administrator_except_owner():
    """
    A user who is an administrator in a mail_domain should be allowed to update a user
    access for this mail_domain, as long as they don't try to set the role to owner.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory(
        users=[(user, enums.MailDomainRoleChoices.ADMIN)]
    )
    access = factories.MailDomainAccessFactory(
        domain=mail_domain,
        role=random.choice(
            [enums.MailDomainRoleChoices.ADMIN, enums.MailDomainRoleChoices.VIEWER]
        ),
    )
    old_values = serializers.MailDomainAccessSerializer(instance=access).data

    new_values = {
        "id": uuid4(),
        "user_id": core_factories.UserFactory().id,
        "role": random.choice(
            [enums.MailDomainRoleChoices.ADMIN, enums.MailDomainRoleChoices.VIEWER]
        ),
    }

    client = APIClient()
    client.force_login(user)
    for field, value in new_values.items():
        new_data = {**old_values, field: value}
        response = client.put(
            f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/{access.id!s}/",
            data=new_data,
            format="json",
        )

        if (
            new_data["role"] == old_values["role"]
        ):  # we are not really updating the role
            assert response.status_code == status.HTTP_403_FORBIDDEN
        else:
            assert response.status_code == 200

        access.refresh_from_db()
        updated_values = serializers.MailDomainAccessSerializer(instance=access).data
        if field == "role":
            assert updated_values == {**old_values, "role": new_values["role"]}
        else:
            assert updated_values == old_values


def test_api_mail_domain__accesses_update_administrator_from_owner():
    """
    A user who is an administrator in a mail_domain, should not be allowed to update
    the user access of an "owner" for this mail_domain.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory(
        users=[(user, enums.MailDomainRoleChoices.ADMIN)]
    )
    other_user = core_factories.UserFactory()
    access = factories.MailDomainAccessFactory(
        domain=mail_domain, user=other_user, role=enums.MailDomainRoleChoices.OWNER
    )
    old_values = serializers.MailDomainAccessSerializer(instance=access).data

    new_values = {
        "id": uuid4(),
        "user_id": core_factories.UserFactory().id,
        "role": random.choice(enums.MailDomainRoleChoices.choices)[0],
    }

    client = APIClient()
    client.force_login(user)
    for field, value in new_values.items():
        response = client.put(
            f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/{access.id!s}/",
            data={**old_values, field: value},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
        access.refresh_from_db()
        updated_values = serializers.MailDomainAccessSerializer(instance=access).data
        assert updated_values == old_values


def test_api_mail_domain__accesses_update_administrator_to_owner():
    """
    A user who is an administrator in a mail_domain, should not be allowed to update
    the user access of another user to grant mail_domain ownership.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory(
        users=[(user, enums.MailDomainRoleChoices.ADMIN)]
    )
    other_user = core_factories.UserFactory()
    access = factories.MailDomainAccessFactory(
        domain=mail_domain,
        user=other_user,
        role=random.choice(
            [enums.MailDomainRoleChoices.ADMIN, enums.MailDomainRoleChoices.VIEWER]
        ),
    )
    old_values = serializers.MailDomainAccessSerializer(instance=access).data

    new_values = {
        "id": uuid4(),
        "user_id": core_factories.UserFactory().id,
        "role": enums.MailDomainRoleChoices.OWNER,
    }

    client = APIClient()
    client.force_login(user)
    for field, value in new_values.items():
        new_data = {**old_values, field: value}
        response = client.put(
            f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/{access.id!s}/",
            data=new_data,
            format="json",
        )
        # We are not allowed or not really updating the role
        if field == "role" or new_data["role"] == old_values["role"]:
            assert response.status_code == status.HTTP_403_FORBIDDEN
        else:
            assert response.status_code == 200

        access.refresh_from_db()
        updated_values = serializers.MailDomainAccessSerializer(instance=access).data
        assert updated_values == old_values


def test_api_mail_domain__accesses_update_owner_except_owner():
    """
    A user who is an owner in a domain should be allowed to update
    a user access for this domain except for existing "owner" accesses.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory(
        users=[(user, enums.MailDomainRoleChoices.OWNER)]
    )
    core_factories.UserFactory()
    access = factories.MailDomainAccessFactory(
        domain=mail_domain,
        role=random.choice(
            [enums.MailDomainRoleChoices.ADMIN, enums.MailDomainRoleChoices.VIEWER]
        ),
    )
    old_values = serializers.MailDomainAccessSerializer(instance=access).data

    new_values = {
        "id": uuid4(),
        "user_id": core_factories.UserFactory().id,
        "role": random.choice(enums.MailDomainRoleChoices.choices)[0],
    }

    client = APIClient()
    client.force_login(user)
    for field, value in new_values.items():
        new_data = {**old_values, field: value}
        response = client.put(
            f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/{access.id!s}/",
            data=new_data,
            format="json",
        )

        if (
            new_data["role"] == old_values["role"]
        ):  # we are not really updating the role
            assert response.status_code == status.HTTP_403_FORBIDDEN
        else:
            assert response.status_code == 200

        access.refresh_from_db()
        updated_values = serializers.MailDomainAccessSerializer(instance=access).data

        if field == "role":
            assert updated_values == {**old_values, "role": new_values["role"]}
        else:
            assert updated_values == old_values


def test_api_mail_domain__accesses_update_owner_for_owners():
    """
    A user who is "owner" of a mail_domain should not be allowed to update
    an existing owner access for this mail_domain.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory(
        users=[(user, enums.MailDomainRoleChoices.OWNER)]
    )
    access = factories.MailDomainAccessFactory(
        domain=mail_domain, role=enums.MailDomainRoleChoices.OWNER
    )
    old_values = serializers.MailDomainAccessSerializer(instance=access).data

    new_values = {
        "id": uuid4(),
        "user_id": core_factories.UserFactory().id,
        "role": random.choice(enums.MailDomainRoleChoices.choices)[0],
    }

    client = APIClient()
    client.force_login(user)
    for field, value in new_values.items():
        response = client.put(
            f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/{access.id!s}/",
            data={**old_values, field: value},
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
        access.refresh_from_db()
        updated_values = serializers.MailDomainAccessSerializer(instance=access).data
        assert updated_values == old_values


def test_api_mail_domain__accesses_update_owner_self():
    """
    A user who is owner of a mail_domain should be allowed to update
    their own user access provided there are other owners in the mail_domain.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory()
    access = factories.MailDomainAccessFactory(
        domain=mail_domain, user=user, role=enums.MailDomainRoleChoices.OWNER
    )
    old_values = serializers.MailDomainAccessSerializer(instance=access).data
    new_role = random.choice(
        [enums.MailDomainRoleChoices.ADMIN, enums.MailDomainRoleChoices.VIEWER]
    )

    client = APIClient()
    client.force_login(user)
    response = client.put(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/{access.id!s}/",
        data={**old_values, "role": new_role},
        format="json",
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    access.refresh_from_db()
    assert access.role == enums.MailDomainRoleChoices.OWNER

    # Add another owner and it should now work
    factories.MailDomainAccessFactory(
        domain=mail_domain, role=enums.MailDomainRoleChoices.OWNER
    )

    response = client.put(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/{access.id!s}/",
        data={**old_values, "role": new_role},
        format="json",
    )

    assert response.status_code == 200
    access.refresh_from_db()
    assert access.role == new_role
