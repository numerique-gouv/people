"""
Tests for MailDomains API endpoint in People's app mailbox_manager. Focus on "check" action.
"""

import re

import pytest
import responses
from rest_framework import status
from rest_framework.test import APIClient

from core import factories as core_factories

from mailbox_manager import enums, factories
from mailbox_manager.utils.dimail import DimailAPIClient

client = DimailAPIClient()

pytestmark = pytest.mark.django_db



@pytest.fixture
def domain():
    """Create an enabled domain"""
    return factories.MailDomainEnabledFactory()


@pytest.fixture
def pending_domain():
    """Create an pending domain"""
    return factories.MailDomainFactory()


def test_api_mail_domains__check_anonymous(domain):
    """Anonymous user cannot request a domain check."""

    with responses.RequestsMock():
        # no call expected
        response = APIClient().get(
            f"/api/v1.0/mail-domains/{domain.slug}/check/",
            format="json",
        )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_api_mail_domains__check_unrelated(domain):
    """User not related to a domain cannot request a domain check."""
    user = core_factories.UserFactory(sub="604cd841-4596-43c8-8d35-34018b25086b")
    client = APIClient()
    client.force_login(user)

    with responses.RequestsMock():
        # no call expected
        response = client.get(
            f"/api/v1.0/mail-domains/{domain.slug}/check/",
            format="json",
        )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_api_mail_domains__check_domain_viewer(domain):
    """Domain viewer should not be able to request a domain check."""
    user = core_factories.UserFactory(sub="604cd841-4596-43c8-8d35-34018b25086b")
    factories.MailDomainAccessFactory(
        user=user, domain=domain, role=enums.MailDomainRoleChoices.VIEWER
    )

    client = APIClient()
    client.force_login(user)

    with responses.RequestsMock():
        # no call expected
        response = client.get(
            f"/api/v1.0/mail-domains/{domain.slug}/check/",
            format="json",
        )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_api_mail_domains__check_domain_admin(domain):
    """Domain admin should be able to request a domain check."""
    user = core_factories.UserFactory(sub="604cd841-4596-43c8-8d35-34018b25086b")
    factories.MailDomainAccessFactory(
        user=user, domain=domain, role=enums.MailDomainRoleChoices.ADMIN
    )

    client = APIClient()
    client.force_login(user)

    with responses.RequestsMock() as rsps:
        print(domain.name)

        rsps.add(
            rsps.GET,
            re.compile(rf".*/domains/{domain.name}/check/"),
            body=str(
                {
                    "name": f"{domain.name}",
                    "state": "broken",
                    "valid": False,
                    "delivery": "virtual",
                    "features": ["webmail", "mailbox", "alias"],
                    "webmail_domain": None,
                    "imap_domain": None,
                    "smtp_domain": None,
                    "context_name": "context",
                    "transport": None,
                    "domain_exist": {"ok": True, "internal": False, "errors": []},
                    "mx": {
                        "ok": False,
                        "internal": False,
                        "errors": [],
                    },
                    "cname_imap": {
                        "ok": False,
                        "internal": False,
                        "errors": [],
                    },
                    "cname_smtp": {
                        "ok": False,
                        "internal": False,
                        "errors": [],
                    },
                    "cname_webmail": {
                        "ok": False,
                        "internal": False,
                        "errors": [],
                    },
                    "spf": {
                        "ok": False,
                        "internal": False,
                        "errors": [],
                    },
                    "dkim": {
                        "ok": False,
                        "internal": False,
                        "errors": [],
                    },
                    "postfix": {"ok": True, "internal": True, "errors": []},
                    "ox": {"ok": True, "internal": True, "errors": []},
                    "cert": {
                        "ok": False,
                        "internal": True,
                        "errors": [],
                    },
                }
            ).replace("'", '"'),
            status=status.HTTP_200_OK,
            content_type="application/json",
        )
        response = client.get(f"/api/v1.0/mail-domains/{domain.slug}/check/")
        assert response.status_code == status.HTTP_200_OK
        assert domain.status == enums.MailDomainStatusChoices.FAILED


def test_dimail_check__pending_is_ok(caplog, pending_domain):
    """Check on a 'pending' domain should trigger a change of state if ok."""
    user = core_factories.UserFactory(sub="604cd841-4596-43c8-8d35-34018b25086b")
    factories.MailDomainAccessFactory(
        user=user, domain=pending_domain, role=enums.MailDomainRoleChoices.OWNER
    )

    client = APIClient()
    client.force_login(user)

    # we use mock here as we don't know how to get a state : ok from dimail
    with responses.RequestsMock() as rsps:
        rsps.add(
            rsps.GET,
            re.compile(rf".*/domains/{pending_domain.name}/check/"),
            body=str(
                {
                    "name": pending_domain.name,
                    "state": "broken",
                    "valid": False,
                    "delivery": "virtual",
                    "features": ["webmail", "mailbox"],
                    "webmail_domain": None,
                    "imap_domain": None,
                    "smtp_domain": None,
                    "context_name": "wolf-jenkins.net",
                    "transport": None,
                    "domain_exist": {
                        "ok": False,
                        "internal": False,
                        "errors": [
                            {
                                "code": "must_exist",
                                "detail": "Le domaine wolf-jenkins.net n'existe pas",
                            }
                        ],
                    },
                    "mx": {"ok": True, "internal": False, "errors": []},
                    "cname_imap": {"ok": True, "internal": False, "errors": []},
                    "cname_smtp": {"ok": True, "internal": False, "errors": []},
                    "cname_webmail": {"ok": True, "internal": False, "errors": []},
                    "spf": {"ok": True, "internal": False, "errors": []},
                    "dkim": {"ok": True, "internal": False, "errors": []},
                    "postfix": {"ok": True, "internal": True, "errors": []},
                    "ox": {"ok": True, "internal": True, "errors": []},
                    "cert": {"ok": True, "internal": True, "errors": []},
                }
            ).replace("'", '"'),
            status=status.HTTP_200_OK,
            content_type="application/json",
        )
        response = client.get(f"/api/v1.0/mail-domains/{pending_domain.slug}/check/")

    assert pending_domain.status == enums.MailDomainStatusChoices.PENDING
    response = client.get(f"/api/v1.0/mail-domains/{pending_domain.slug}/check/")
    assert response.status_code == status.HTTP_200_OK
    assert pending_domain.status == enums.MailDomainStatusChoices.ENABLED


def test_api_mail_domains__check_broken_domain_changes_status():
    """Check on an 'enabled' domain should trigger a change of state if broken."""
    user = core_factories.UserFactory(sub="604cd841-4596-43c8-8d35-34018b25086b")
    domain = factories.MailDomainEnabledFactory()
    factories.MailDomainAccessFactory(
        user=user, domain=domain, role=enums.MailDomainRoleChoices.OWNER
    )

    dimail_client = DimailAPIClient()
    dimail_client.create_domain(domain.name, user.sub)
    dimail_client.create_user(user.sub)
    dimail_client.create_allow(user.sub, domain.name)

    client = APIClient()
    client.force_login(user)
    assert domain.status == enums.MailDomainStatusChoices.ENABLED

    with responses.RequestsMock() as rsps:
        rsps.add(
            rsps.GET,
            re.compile(r".*/token/"),
            body='{"access_token": "dimail_people_token"}',
            status=status.HTTP_200_OK,
            content_type="application/json",
        )
        rsps.add(
            rsps.GET,
            re.compile(rf".*/domains/{domain.name}/check/"),
            body=str(
                {
                    "name": "test.domain.com",
                    "state": "broken",
                    "valid": False,
                    "delivery": "virtual",
                    "features": ["webmail", "mailbox", "alias"],
                    "webmail_domain": None,
                    "imap_domain": None,
                    "smtp_domain": None,
                    "context_name": "context",
                    "transport": None,
                    "domain_exist": {"ok": True, "internal": False, "errors": []},
                    "mx": {
                        "ok": False,
                        "internal": False,
                        "errors": [],
                    },
                    "cname_imap": {
                        "ok": False,
                        "internal": False,
                        "errors": [],
                    },
                    "cname_smtp": {
                        "ok": False,
                        "internal": False,
                        "errors": [],
                    },
                    "cname_webmail": {
                        "ok": False,
                        "internal": False,
                        "errors": [],
                    },
                    "spf": {
                        "ok": False,
                        "internal": False,
                        "errors": [],
                    },
                    "dkim": {
                        "ok": False,
                        "internal": False,
                        "errors": [],
                    },
                    "postfix": {"ok": True, "internal": True, "errors": []},
                    "ox": {"ok": True, "internal": True, "errors": []},
                    "cert": {
                        "ok": False,
                        "internal": True,
                        "errors": [],
                    },
                }
            ).replace("'", '"'),
            status=status.HTTP_200_OK,
            content_type="application/json",
            )
        response = client.get(f"/api/v1.0/mail-domains/{domain.slug}/check/")

        assert response.status_code == status.HTTP_200_OK
        assert domain.status == enums.MailDomainStatusChoices.FAILED
