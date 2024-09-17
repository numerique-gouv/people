"""
Test for mail_domain accesses API endpoints in People's core app : list
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from core import factories as core_factories

from mailbox_manager import enums, factories, models

pytestmark = pytest.mark.django_db


def test_api_mail_domain__accesses_list_anonymous():
    """Anonymous users should not be allowed to list mail_domain accesses."""
    mail_domain = factories.MailDomainFactory()
    factories.MailDomainAccessFactory.create_batch(2, domain=mail_domain)

    response = APIClient().get(f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }


def test_api_mail_domain__accesses_list_authenticated_unrelated():
    """
    Authenticated users should not be allowed to list mail_domain accesses for a mail_domain
    to which they are not related.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory()
    factories.MailDomainAccessFactory.create_batch(3, domain=mail_domain)

    # Accesses for other mail_domains to which the user is related should not be listed either
    other_access = factories.MailDomainAccessFactory(user=user)
    factories.MailDomainAccessFactory(domain=other_access.domain)

    client = APIClient()
    client.force_login(user)
    response = client.get(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/",
    )
    assert response.status_code == 200
    assert response.json() == {
        "count": 0,
        "next": None,
        "previous": None,
        "results": [],
    }


def test_api_mail_domain__accesses_list_authenticated_related():
    """
    Authenticated users should be able to list mail_domain accesses for a mail_domain
    to which they are related, with a given role.
    """
    viewer, administrator, owner = core_factories.UserFactory.create_batch(3)
    mail_domain = factories.MailDomainFactory()

    access1 = factories.MailDomainAccessFactory.create(
        domain=mail_domain, user=owner, role=enums.MailDomainRoleChoices.OWNER
    )
    access2 = factories.MailDomainAccessFactory.create(
        domain=mail_domain, user=administrator, role=enums.MailDomainRoleChoices.ADMIN
    )
    access3 = models.MailDomainAccess.objects.create(
        domain=mail_domain, user=viewer, role=enums.MailDomainRoleChoices.VIEWER
    )

    admin_expected_data = {
        "id": str(access2.id),
        "user": {
            "id": str(administrator.id),
            "email": str(administrator.email),
            "name": str(administrator.name),
        },
        "role": str(access2.role),
    }
    viewer_expected_data = {
        "id": str(access3.id),
        "user": {
            "id": str(viewer.id),
            "email": str(viewer.email),
            "name": str(viewer.name),
        },
        "role": str(access3.role),
    }
    owner_expected_data = {
        "id": str(access1.id),
        "user": {
            "id": str(owner.id),
            "email": str(owner.email),
            "name": str(owner.name),
        },
        "role": str(access1.role),
    }

    # Grant other mail_domain accesses to the user, they should not be listed either
    other_access = factories.MailDomainAccessFactory(user=viewer)
    factories.MailDomainAccessFactory(domain=other_access.domain)

    client = APIClient()
    client.force_login(viewer)
    # viewer can see accesses but no action is available
    admin_expected_data["can_set_role_to"] = []
    viewer_expected_data["can_set_role_to"] = []
    owner_expected_data["can_set_role_to"] = []
    response = client.get(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/",
    )
    assert response.status_code == 200
    assert response.json()["count"] == 3
    expected = sorted(
        [admin_expected_data, viewer_expected_data, owner_expected_data],
        key=lambda x: x["role"],
    )
    assert sorted(response.json()["results"], key=lambda x: x["role"]) == expected

    client.force_login(administrator)
    # administrator can see and give new role but not an OWNER role
    admin_expected_data["can_set_role_to"] = [enums.MailDomainRoleChoices.VIEWER]
    viewer_expected_data["can_set_role_to"] = [enums.MailDomainRoleChoices.ADMIN]
    owner_expected_data["can_set_role_to"] = []
    response = client.get(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/",
    )
    assert response.status_code == 200
    assert response.json()["count"] == 3
    expected = sorted(
        [admin_expected_data, viewer_expected_data, owner_expected_data],
        key=lambda x: x["role"],
    )
    assert sorted(response.json()["results"], key=lambda x: x["role"]) == expected

    client.force_login(owner)
    # owner can do everything
    admin_expected_data["can_set_role_to"] = [
        enums.MailDomainRoleChoices.OWNER,
        enums.MailDomainRoleChoices.VIEWER,
    ]
    viewer_expected_data["can_set_role_to"] = [
        enums.MailDomainRoleChoices.ADMIN,
        enums.MailDomainRoleChoices.OWNER,
    ]
    owner_expected_data["can_set_role_to"] = [
        enums.MailDomainRoleChoices.ADMIN,
        enums.MailDomainRoleChoices.VIEWER,
    ]
    response = client.get(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/",
    )
    assert response.status_code == 200
    assert response.json()["count"] == 3

    expected = sorted(
        [admin_expected_data, viewer_expected_data, owner_expected_data],
        key=lambda x: x["role"],
    )
    assert sorted(response.json()["results"], key=lambda x: x["role"]) == expected


def test_api_mail_domain__accesses_list_authenticated_constant_numqueries(
    django_assert_num_queries,
):
    """
    The number of queries should not depend on the amount of fetched accesses.
    """
    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory()
    models.MailDomainAccess.objects.create(domain=mail_domain, user=user)  # random role

    client = APIClient()
    client.force_login(user)
    # Only 3 queries are needed to efficiently fetch mail_domain accesses,
    # related users :
    # - query retrieving logged-in user for user_role annotation
    # - count from pagination
    # - distinct from viewset
    with django_assert_num_queries(3):
        response = client.get(
            f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/",
        )

    # create 20 new mail_domain members
    for _ in range(20):
        extra_user = core_factories.UserFactory()
        factories.MailDomainAccessFactory(domain=mail_domain, user=extra_user)

    # num queries should still be the same
    with django_assert_num_queries(3):
        response = client.get(
            f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/",
        )

    assert response.status_code == 200
    assert response.json()["count"] == 21


def test_api_mail_domain__accesses_list_authenticated_ordering():
    """MailDomain  accesses can be ordered by "role"."""

    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory()
    models.MailDomainAccess.objects.create(domain=mail_domain, user=user)

    # create 20 new mail_domain members ?????
    for _ in range(20):
        extra_user = core_factories.UserFactory()
        factories.MailDomainAccessFactory(domain=mail_domain, user=extra_user)

    client = APIClient()
    client.force_login(user)

    response = client.get(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/?ordering=role",
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["count"] == 21

    results = [access["role"] for access in response.json()["results"]]
    assert sorted(results) == results

    response = client.get(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/?ordering=-role",
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["count"] == 21

    results = [access["role"] for access in response.json()["results"]]
    assert sorted(results, reverse=True) == results


@pytest.mark.parametrize("ordering_field", ["email", "name"])
def test_api_mail_domain__accesses_list_authenticated_ordering_user(ordering_field):
    """Team accesses can be ordered by user's fields."""

    user = core_factories.UserFactory()
    mail_domain = factories.MailDomainFactory()
    models.MailDomainAccess.objects.create(domain=mail_domain, user=user)

    for _ in range(20):
        extra_user = core_factories.UserFactory()
        factories.MailDomainAccessFactory(domain=mail_domain, user=extra_user)

    client = APIClient()
    client.force_login(user)

    response = client.get(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/accesses/?ordering=user__{ordering_field}",
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["count"] == 21

    def normalize(x):
        """Mimic Django order_by, which is case-insensitive and space-insensitive"""
        return x.casefold().replace(" ", "")

    results = [access["user"][ordering_field] for access in response.json()["results"]]
    assert sorted(results, key=normalize) == results
