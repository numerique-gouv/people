"""
Unit tests for dimail client
"""

import logging
import re

import pytest
import responses
from rest_framework import status

from mailbox_manager import factories, models
from mailbox_manager.utils.dimail import DimailAPIClient

pytestmark = pytest.mark.django_db


def test_dimail_synchronization__already_sync():
    """
    No mailbox should be created when everything is already synced.
    """
    domain = factories.MailDomainEnabledFactory()
    factories.MailboxFactory.create_batch(3, domain=domain)

    pre_sync_mailboxes = models.Mailbox.objects.filter(domain=domain)
    assert pre_sync_mailboxes.count() == 3

    dimail_client = DimailAPIClient()
    with responses.RequestsMock() as rsps:
        # Ensure successful response using "responses":
        rsps.add(
            rsps.GET,
            re.compile(r".*/token/"),
            body='{"access_token": "dimail_people_token"}',
            status=status.HTTP_200_OK,
            content_type="application/json",
        )
        rsps.add(
            rsps.GET,
            re.compile(rf".*/domains/{domain.name}/mailboxes/"),
            body=str(
                [
                    {
                        "type": "mailbox",
                        "status": "broken",
                        "email": f"{mailbox.local_part}@{domain.name}",
                        "givenName": mailbox.first_name,
                        "surName": mailbox.last_name,
                        "displayName": f"{mailbox.first_name} {mailbox.last_name}",
                        "additionalSenders": [],
                    }
                    for mailbox in pre_sync_mailboxes
                ]
            ).replace("'", '"'),
            status=status.HTTP_200_OK,
            content_type="application/json",
        )
        imported_mailboxes = dimail_client.import_mailboxes(domain)

    post_sync_mailboxes = models.Mailbox.objects.filter(domain=domain)
    assert post_sync_mailboxes.count() == 3
    assert imported_mailboxes == []
    assert set(models.Mailbox.objects.filter(domain=domain)) == set(pre_sync_mailboxes)


def test_dimail_synchronization__synchronize_mailboxes(caplog):
    """A mailbox existing only on dimail should be synchronized
    upon calling sync function on its domain."""
    caplog.set_level(logging.INFO)

    domain = factories.MailDomainEnabledFactory()
    assert not models.Mailbox.objects.exists()

    dimail_client = DimailAPIClient()
    with responses.RequestsMock() as rsps:
        # Ensure successful response using "responses":
        rsps.add(
            rsps.GET,
            re.compile(r".*/token/"),
            body='{"access_token": "dimail_people_token"}',
            status=status.HTTP_200_OK,
            content_type="application/json",
        )

        mailbox_valid = {
            "type": "mailbox",
            "status": "broken",
            "email": f"oxadmin@{domain.name}",
            "givenName": "Admin",
            "surName": "Context",
            "displayName": "Context Admin",
            "additionalSenders": [],
        }
        mailbox_valid_additional_senders = {
            "type": "mailbox",
            "status": "broken",
            "email": f"prudence_crandall@{domain.name}",
            "givenName": "Admin",
            "surName": "Context",
            "displayName": "Context Admin",
            "additionalSenders": ["prudence@ct.gov"],
        }
        mailbox_with_wrong_domain = {
            "type": "mailbox",
            "status": "broken",
            "email": "johndoe@wrongdomain.com",
            "givenName": "John",
            "surName": "Doe",
            "displayName": "John Doe",
        }
        mailbox_invalid_domain = {
            "type": "mailbox",
            "status": "broken",
            "email": f"naw@ake@{domain.name}",
            "givenName": "Joe",
            "surName": "Doe",
            "displayName": "Joe Doe",
        }
        mailbox_with_invalid_local_part = {
            "type": "mailbox",
            "status": "broken",
            "email": f"obalmaské@{domain.name}",
            "givenName": "Jean",
            "surName": "Vang",
            "displayName": "Jean Vang",
        }
        import json
        null = None
        mailbox_null_names = {
            "type": "mailbox",
            "status": "broken",
            "email": f"null@{domain.name}",
            "givenName": null,
            "surName": null,
            "displayName": null,
        }

        rsps.add(
            rsps.GET,
            re.compile(rf".*/domains/{domain.name}/mailboxes/"),
            body=str(
                [
                    mailbox_valid,
                    mailbox_valid_additional_senders,
                    # mailbox_with_wrong_domain,
                    # mailbox_invalid_domain,
                    # mailbox_with_invalid_local_part,
                    mailbox_null_names,
                ]
            ).replace("'", '"'),
            status=status.HTTP_200_OK,
            content_type="application/json",
        )

        imported_mailboxes = dimail_client.import_mailboxes(domain)

    # 1 token requested
    # + 3 imports failed: wrong domain, HeaderParseError, NonASCIILocalPartDefect
    assert len(caplog.records) == 4

    # first we try to import email with a wrong domain
    assert (
        caplog.records[1].message
        == f"Import of email {mailbox_with_wrong_domain["email"]} failed because of a wrong domain"
    )

    # then we try to import email with invalid domain
    invalid_mailbox_log = caplog.records[2]
    assert (
        invalid_mailbox_log.message
        == f"Import of email {mailbox_invalid_domain['email']} failed with error Invalid Domain"
    )

    # then we try to import email with non ascii local part
    non_ascii_mailbox_log = caplog.records[3]
    email = mailbox_with_invalid_local_part["email"]
    assert (
        non_ascii_mailbox_log.message
        == f"Import of email {email} failed with error local-part contains non-ASCII characters)"
    )

    assert imported_mailboxes == [
        mailbox_valid["email"],
        mailbox_valid_additional_senders["email"],
    ]
    mailboxes = models.Mailbox.objects.all()
    assert mailboxes[0].local_part == "oxadmin"
    assert mailboxes[1].local_part == "prudence_crandall"
