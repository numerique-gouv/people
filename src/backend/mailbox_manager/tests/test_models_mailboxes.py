"""
Unit tests for the mailbox model
"""

import json
import logging
import re
from logging import Logger
from unittest import mock

from django.core import exceptions
from django.core.exceptions import ValidationError

import pytest
import requests
import responses
from urllib3.util import Retry

from mailbox_manager import factories, models

pytestmark = pytest.mark.django_db

logger = logging.getLogger(__name__)

adapter = requests.adapters.HTTPAdapter(
    max_retries=Retry(
        total=4,
        backoff_factor=0.1,
        status_forcelist=[500, 502],
        allowed_methods=["PATCH"],
    )
)

# LOCAL PART FIELD


def test_models_mailboxes__local_part_cannot_be_empty():
    """The "local_part" field should not be empty."""
    with pytest.raises(ValidationError, match="This field cannot be blank"):
        factories.MailboxFactory(local_part="")


def test_models_mailboxes__local_part_cannot_be_null():
    """The "local_part" field should not be null."""
    with pytest.raises(ValidationError, match="This field cannot be null"):
        factories.MailboxFactory(local_part=None)


def test_models_mailboxes__local_part_matches_expected_format():
    """
    The local part should contain alpha-numeric caracters
    and a limited set of special caracters ("+", "-", ".", "_").
    """
    factories.MailboxFactory(local_part="Marie-Jose.Perec+JO_2024")

    with pytest.raises(ValidationError, match="Enter a valid value"):
        factories.MailboxFactory(local_part="mariejo@unnecessarydomain.com")

    with pytest.raises(ValidationError, match="Enter a valid value"):
        factories.MailboxFactory(local_part="!")


def test_models_mailboxes__local_part_unique_per_domain():
    """Local parts should be unique per domain."""

    existing_mailbox = factories.MailboxFactory()

    # same local part on another domain should not be a problem
    factories.MailboxFactory(local_part=existing_mailbox.local_part)

    # same local part on the same domain should not be possible
    with pytest.raises(
        ValidationError, match="Mailbox with this Local_part and Domain already exists."
    ):
        factories.MailboxFactory(
            local_part=existing_mailbox.local_part, domain=existing_mailbox.domain
        )


# DOMAIN FIELD

session = requests.Session()
session.mount("http://", adapter)


def test_models_mailboxes__domain_must_be_a_maildomain_instance():
    """The "domain" field should be an instance of MailDomain."""
    expected_error = '"Mailbox.domain" must be a "MailDomain" instance.'
    with pytest.raises(ValueError, match=expected_error):
        factories.MailboxFactory(domain="")

    with pytest.raises(ValueError, match=expected_error):
        factories.MailboxFactory(domain="domain-as-string.com")


def test_models_mailboxes__domain_cannot_be_null():
    """The "domain" field should not be null."""
    with pytest.raises(models.MailDomain.DoesNotExist, match="Mailbox has no domain."):
        factories.MailboxFactory(domain=None)


# SECONDARY_EMAIL FIELD


def test_models_mailboxes__secondary_email_cannot_be_empty():
    """The "secondary_email" field should not be empty."""
    with pytest.raises(ValidationError, match="This field cannot be blank"):
        factories.MailboxFactory(secondary_email="")


def test_models_mailboxes__secondary_email_cannot_be_null():
    """The "secondary_email" field should not be null."""
    with pytest.raises(ValidationError, match="This field cannot be null"):
        factories.MailboxFactory(secondary_email=None)


### SYNC TO DIMAIL-API


def test_models_mailboxes__no_secret():
    """If no secret is declared on the domain, the function should raise an error."""

    domain = factories.MailDomainFactory(secret=None)

    with pytest.raises(
        exceptions.FieldError,
        match="Please configure your domain's secret before creating any mailbox.",
    ):
        factories.MailboxFactory(domain=domain)


@mock.patch.object(Logger, "error")
def test_models_mailboxes__wrong_secret(mock_info):
    """If domain secret is inaccurate, the function should raise an error."""

    with responses.RequestsMock() as rsps:
        # Ensure successful response by scim provider using "responses":
        sp = rsps.add(
            rsps.GET,
            re.compile(r".*/token/"),
            body='{"detail": "Permission denied"}',
            status=200,
            content_type="application/json",
        )

        mailbox = factories.MailboxFactory()

        # Payload sent to mailbox provider
        payload = json.loads(call.request.body)
        assert payload == {
            "displayName": f'{mailbox_data["local_part"]} Test',
            "email": f'{mailbox_data["local_part"]}@{domain.name}',
            "givenName": f'{mailbox_data["local_part"]}',
            "surName": "Test",
        }


@mock.patch.object(Logger, "info")
def test_models_mailboxes__create_mailbox_success(mock_info):
    """Creating a mailbox sends the expected information and get expected response before saving."""
    domain = factories.MailDomainFactory()

    with responses.RequestsMock() as rsps:
        # Ensure successful response by scim provider using "responses":
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
            body='{"email": f"{mailbox_data.local_part}@{mailbox_data.domain.name}", "password": "newpass", "uuid": "uuid}',
            status=201,
            content_type="application/json",
        )

        mailbox = factories.MailboxFactory(domain=domain)

        assert rsps.calls[1].request.url == webhook.url

        # Check headers
        headers = rsps.calls[1].request.headers
        assert "Authorization" not in headers
        assert headers["Content-Type"] == "application/json"

        # Payload sent to mailbox provider
        payload = json.loads(call.request.body)
        assert payload == {
            "displayName": f"{mailbox.local_part} Test",
            "email": f"{mailbox_data.local_part}@{domain.name}",
            "givenName": f"{mailbox_data.local_part}",
            "surName": "Test",
        }

    # Logger
    assert mock_info.call_count == 2
    # for i, webhook in enumerate(webhooks):
    #     assert mock_info.call_args_list[i][0] == (
    #         "%s synchronization succeeded with %s",
    #         "add_user_to_group",
    #         webhook.url,
    #     )


def test_models_mailboxes__create_mailbox_duplicate(mock_info):
    """
    Should receive an error if attempting to create an email aleady existing.
    """
    pass
