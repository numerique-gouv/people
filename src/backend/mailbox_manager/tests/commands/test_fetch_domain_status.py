"""Test the `fetch_domain_status_from_dimail` management command"""

import json
import re
from io import StringIO

from django.core.management import call_command

import pytest
import responses

from mailbox_manager import enums, factories
from mailbox_manager.tests.fixtures.dimail import CHECK_DOMAIN_BROKEN, CHECK_DOMAIN_OK

pytestmark = pytest.mark.django_db


def test_fetch_domain_status():
    """Test fetch domain status from dimail"""
    domain_enabled1 = factories.MailDomainEnabledFactory()
    domain_enabled2 = factories.MailDomainEnabledFactory()
    domain_disabled = factories.MailDomainFactory(
        status=enums.MailDomainStatusChoices.DISABLED
    )
    domain_failed = factories.MailDomainFactory(
        status=enums.MailDomainStatusChoices.FAILED
    )

    with responses.RequestsMock() as rsps:
        body_content_ok1 = CHECK_DOMAIN_OK.copy()
        body_content_ok1["name"] = domain_enabled1.name

        body_content_broken = CHECK_DOMAIN_BROKEN.copy()
        body_content_broken["name"] = domain_enabled2.name

        body_content_ok2 = CHECK_DOMAIN_OK.copy()
        body_content_ok2["name"] = domain_disabled.name

        body_content_ok3 = CHECK_DOMAIN_OK.copy()
        body_content_ok3["name"] = domain_failed.name
        for domain, body_content in [
            (domain_enabled1, body_content_ok1),
            (domain_enabled2, body_content_broken),
            (domain_failed, body_content_ok3),
        ]:
            rsps.add(
                rsps.GET,
                re.compile(rf".*/domains/{domain.name}/check/"),
                body=json.dumps(body_content),
                status=200,
                content_type="application/json",
            )
        output = StringIO()
        call_command("fetch_domain_status", verbosity=2, stdout=output)
        domain_enabled1.refresh_from_db()
        domain_enabled2.refresh_from_db()
        domain_disabled.refresh_from_db()
        domain_failed.refresh_from_db()
        assert domain_enabled1.status == enums.MailDomainStatusChoices.ENABLED
        assert domain_enabled2.status == enums.MailDomainStatusChoices.FAILED
        # disabled domain was excluded
        assert domain_disabled.status == enums.MailDomainStatusChoices.DISABLED
        assert domain_failed.status == enums.MailDomainStatusChoices.ENABLED
        assert output.getvalue().count("OK") == 3
