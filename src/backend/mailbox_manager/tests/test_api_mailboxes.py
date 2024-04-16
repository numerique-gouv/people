import pytest
from rest_framework.test import APIClient

from core import factories as core_factories

from mailbox_manager import factories, models

pytestmark = pytest.mark.django_db


def test_api_mailboxes__list_anonymous():
    """Anonymous users should not be allowed to list mailboxes."""

    mail_domain = factories.MailDomainFactory()
    factories.MailboxFactory.create_batch(2, domain=mail_domain)

    response = APIClient().get(f"/api/v1.0/mail-domain/{mail_domain.id}/mailboxes/")

    assert response.status_code == 401
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

    response = client.get(f"/api/v1.0/mail-domain/{mail_domain.id}/mailboxes/")

    assert response.status_code == 200
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


def test_api_mailboxes__create_anonymous_forbidden():
    """Anonymous users should not be able to create a new mailbox via the API."""
    mail_domain = factories.MailDomainFactory()

    response = APIClient().post(
        f"/api/v1.0/mail-domain/{mail_domain.id}/mailboxes/",
        {
            "first_name": "jean",
            "last_name": "doe",
            "local_part": "jean.doe",
            "secondary_email": "jean.doe@gmail.com",
            "phone_number": "+33150142700",
        },
    )

    assert response.status_code == 401
    assert not models.Mailbox.objects.exists()


def test_api_mailboxes__create_authenticated_missing_field():
    """Authenticated users should be able to create mailbox with local part."""
    user = core_factories.UserFactory(admin_email="tester@ministry.fr")
    core_factories.IdentityFactory(user=user, email=user.admin_email, name="john doe")

    client = APIClient()
    client.force_login(user)

    mail_domain = factories.MailDomainFactory()
    response = client.post(
        f"/api/v1.0/mail-domain/{mail_domain.id}/mailboxes/",
        {
            "first_name": "jean",
            "last_name": "doe",
            "secondary_email": "jean.doe@gmail.com",
            "phone_number": "+33150142700",
        },
        format="json",
    )
    assert response.status_code == 400
    assert models.Mailbox.objects.exists() is False

    assert response.json() == {"local_part": ["This field is required."]}


def test_api_mailboxes_create__authenticated_successful():
    """ """
    user = core_factories.UserFactory(admin_email="tester@ministry.fr")
    core_factories.IdentityFactory(user=user, email=user.admin_email, name="john doe")

    client = APIClient()
    client.force_login(user)

    mail_domain = factories.MailDomainFactory(name="saint-jean.collectivite.fr")
    response = client.post(
        f"/api/v1.0/mail-domain/{mail_domain.id}/mailboxes/",
        {
            "first_name": "jean",
            "last_name": "doe",
            "local_part": "jean.doe",
            "secondary_email": "jean.doe@gmail.com",
            "phone_number": "+33150142700",
        },
        format="json",
    )
    assert response.status_code == 201

    mailbox = models.Mailbox.objects.get()
    assert mailbox.local_part == "jean.doe"
    assert mailbox.secondary_email == "jean.doe@gmail.com"
    assert response.json() == {
        "id": str(mailbox.id),
        "local_part": str(mailbox.local_part),
        "secondary_email": str(mailbox.secondary_email),
    }


# mock LDAP ????
# backend ldap dummy pour les tests
