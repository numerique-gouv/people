"""
Unit tests for dimail client
"""

import re

import pytest
import responses
from rest_framework import status

from mailbox_manager import enums, factories, models
from mailbox_manager.utils.dimail import DimailAPIClient

pytestmark = pytest.mark.django_db


def test_dimail_synchronization__already_sync():
    """
    Nothing should be created when everything is already synced.
    """
    domain = factories.MailDomainFactory(status=enums.MailDomainStatusChoices.ENABLED)
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
                    }
                    for mailbox in pre_sync_mailboxes
                ]
            ),
            status=status.HTTP_200_OK,
            content_type="application/json",
        )
        dimail_client.synchronize_dimail_mailboxes(domain.name)

    assert set(models.Mailbox.objects.filter(domain=domain)) == set(pre_sync_mailboxes)


def test_dimail_synchronization__synchronize_mailboxes():
    """A mailbox existing solely on dimail should be synchronized
    upon calling sync function on its domain"""
    domain = factories.MailDomainFactory(status=enums.MailDomainStatusChoices.ENABLED)
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
        rsps.add(
            rsps.GET,
            re.compile(rf".*/domains/{domain.name}/mailboxes/"),
            body=str(
                [
                    {
                        "type": "mailbox",
                        "status": "broken",
                        "email": "oxadmin@test.domain.com",
                        "givenName": "Admin",
                        "surName": "Context",
                        "displayName": "Context Admin",
                    }
                ]
            ),
            status=status.HTTP_200_OK,
            content_type="application/json",
        )
        dimail_client.synchronize_dimail_mailboxes(domain.name)

    assert models.Mailbox.objects.exists()
