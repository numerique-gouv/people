"""
Unit tests for the mailbox API
"""

from unittest import mock

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from core import factories as core_factories
from core.api.viewsets import Pagination

from mailbox_manager import factories

pytestmark = pytest.mark.django_db


def test_api_mailboxes__list_anonymous():
    """Anonymous users should not be allowed to list mailboxes."""
    mail_domain = factories.MailDomainFactory()
    factories.MailboxFactory.create_batch(2, domain=mail_domain)

    response = APIClient().get(f"/api/v1.0/mail-domains/{mail_domain.id}/mailboxes/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }


def test_api_mailboxes__list_authenticated_no_query():
    """Authenticated users should be able to list mailboxes without applying a query."""
    user = core_factories.UserFactory(admin_email="tester@ministry.fr")
    core_factories.IdentityFactory(user=user, email=user.admin_email, name="john doe")

    client = APIClient()
    client.force_login(user)

    mail_domain = factories.MailDomainFactory()
    mailbox1 = factories.MailboxFactory(domain=mail_domain)
    mailbox2 = factories.MailboxFactory(domain=mail_domain)

    response = client.get(f"/api/v1.0/mail-domains/{mail_domain.id}/mailboxes/")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["results"] == [
        {
            "id": str(mailbox1.id),
            "local_part": str(mailbox1.local_part),
            "secondary_email": str(mailbox1.secondary_email),
        },
        {
            "id": str(mailbox2.id),
            "local_part": str(mailbox2.local_part),
            "secondary_email": str(mailbox2.secondary_email),
        },
    ]


@mock.patch.object(Pagination, "get_page_size", return_value=3)
def test_api_mailboxes__list_pagination(
    _mock_page_size,
):
    """Pagination should work as expected."""
    identity = core_factories.IdentityFactory()
    user = identity.user

    client = APIClient()
    client.force_login(user)

    domain = factories.MailDomainFactory(users=[(user, "member")])
    factories.MailboxFactory.create_batch(5, domain=domain)

    endpoint = f"api/v1.0/mail-domains/{domain.id}/mailboxes/"

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
