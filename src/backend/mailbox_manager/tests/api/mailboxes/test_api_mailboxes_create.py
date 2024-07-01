"""
Unit tests for the mailbox API
"""

import json
import re

import pytest
import responses
from rest_framework import status
from rest_framework.test import APIClient

from core import factories as core_factories

from mailbox_manager import factories, models
from mailbox_manager.api import serializers

pytestmark = pytest.mark.django_db


def test_api_mailboxes__create_anonymous_forbidden():
    """Anonymous users should not be able to create a new mailbox via the API."""
    mail_domain = factories.MailDomainFactory()

    response = APIClient().post(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/mailboxes/",
        {
            "first_name": "jean",
            "last_name": "doe",
            "local_part": "jean.doe",
            "secondary_email": "jean.doe@gmail.com",
            "phone_number": "+33150142700",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert not models.Mailbox.objects.exists()


def test_api_mailboxes__create_authenticated_missing_fields():
    """
    Authenticated users should not be able to create mailboxes
    without local part or secondary mail.
    """
    user = core_factories.UserFactory(email="tester@ministry.fr", name="john doe")

    client = APIClient()
    client.force_login(user)

    mail_domain = factories.MailDomainFactory()
    response = client.post(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/mailboxes/",
        {
            "first_name": "jean",
            "last_name": "doe",
            "secondary_email": "jean.doe@gmail.com",
            "phone_number": "+33150142700",
        },
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert models.Mailbox.objects.exists() is False
    assert response.json() == {"local_part": ["This field is required."]}

    response = client.post(
        f"/api/v1.0/mail-domains/{mail_domain.slug}/mailboxes/",
        {
            "first_name": "jean",
            "last_name": "doe",
            "local_part": "jean.doe",
            "phone_number": "+33150142700",
        },
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert models.Mailbox.objects.exists() is False
    assert response.json() == {"secondary_email": ["This field is required."]}


def test_api_mailboxes__provisioning_api_not_called_unauthorized():
    """
    Provisioning API should not be called if a user tries
    to create a mailbox on a domain they do not own.
    """
    # creating all necessary objects
    domain = factories.MailDomainFactory()
    mailbox_data = serializers.MailboxSerializer(factories.MailboxFactory.build()).data

    client = APIClient()
    client.force_login(core_factories.UserFactory())  # user with no access

    with responses.RequestsMock() as rsps:
        # Ensure successful response using "responses":
        rsp = rsps.add(
            rsps.GET,
            re.compile(r".*/token/"),
            body='{"access_token": "domain_owner_token"}',
            status=200,
            content_type="application/json",
        )
        rsp = rsps.add(
            rsps.POST,
            re.compile(rf".*/api/domains/{domain.name}/mailboxes/"),
            body='{"detail": "Permission denied"}',
            status=401,
            content_type="application/json",
        )

        response = client.post(
            f"/api/v1.0/mail-domains/{domain.id}/mailboxes/",
            mailbox_data,
            format="json",
        )
        assert response.status_code == 201  # a fix après la PR de Sabrina
        assert rsp.call_count == 1
        # assert rsps.calls[1].request.url == webhook.url  # rsps.calls[0] is the token


def test_api_mailboxes__successful_creation_and_provisioning():
    """
    Domain owner should be able to create mailboxes.
    Provisioning API should be called when owner makes a call.
    Expected response contains new email and password.
    """
    # creating all needed objects
    domain = factories.MailDomainFactory()
    access = factories.MailDomainAccessFactory(domain=domain)

    client = APIClient()
    client.force_login(access.user)
    mailbox_data = serializers.MailboxSerializer(factories.MailboxFactory.build()).data

    with responses.RequestsMock() as rsps:
        # Ensure successful response using "responses":
        rsp = rsps.add(
            rsps.GET,
            re.compile(r".*/token/"),
            body='{"access_token": "domain_owner_token"}',
            status=200,
            content_type="application/json",
        )
        rsp = rsps.add(
            rsps.POST,
            re.compile(rf".*/api/domains/{domain.name}/mailboxes/"),
            body='{"email": f"{mailbox_data.local_part}@{mailbox_data.domain.name}", "password": "newpass", "uuid": "uuid"}',
            status=201,
            content_type="application/json",
        )

        response = client.post(
            f"/api/v1.0/mail-domains/{domain.id}/mailboxes/",
            mailbox_data,
            format="json",
        )
        assert response.status_code == 201
        assert rsp.call_count == 1
        assert rsps.calls[1].request.url == webhook.url  # rsps.calls[0] is the token

        # Payload sent to scim provider
        payload = json.loads(rsps.calls[1].request.body)
        assert payload == {
            "displayName": f'{mailbox_data["local_part"]} Test',
            "email": f'{mailbox_data["local_part"]}@{domain.name}',
            "givenName": f'{mailbox_data["local_part"]}',
            "surName": "Test",
        }

    assert response.status_code == status.HTTP_201_CREATED
    mailbox = models.Mailbox.objects.get()
    assert response.json() == {
        "id": str(mailbox.id),
        "local_part": str(mailbox_data["local_part"]),
        "secondary_email": str(mailbox_data["secondary_email"]),
    }
    assert mailbox.local_part == mailbox_data["local_part"]
    assert mailbox.secondary_email == mailbox_data["secondary_email"]
