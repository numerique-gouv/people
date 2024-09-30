"""Test the `setup_dimail_db` management command"""

from django.core.management import call_command
from django.test import override_settings

import pytest
import requests

from mailbox_manager.management.commands.setup_dimail_db import DIMAIL_URL, admin

pytestmark = pytest.mark.django_db

admin_auth = (admin["username"], admin["password"])


@override_settings(DEBUG=True)
def test_commands_setup_dimail_db():
    """The create_demo management command should create objects as expected."""
    call_command("setup_dimail_db")

    # check created userss
    response = requests.get(url=f"{DIMAIL_URL}/users/", auth=admin_auth, timeout=10)
    users = response.json()
    assert len(users) == 2  # mais en fait 3
    assert users == [
        {
            "is_admin": True,
            "name": "admin",
            "perms": [],
            "uuid": "82110a05-6c53-4f55-b699-33eeb8e87e61",
        },
        {
            "is_admin": False,
            "name": "la_regie",
            "perms": [
                "new_domain",
                "create_users",
                "manage_users",
            ],
            "uuid": "851a4fa1-3b5b-442e-a70d-ea762c15fee4",
        },
    ]

    # check created domains
    response = requests.get(url=f"{DIMAIL_URL}/domains/", auth=admin_auth, timeout=10)
    domains = response.json()
    assert len(domains) == 1
    assert domains[0]["name"] == "test.domain.com"

    # check created allows
    response = requests.get(url=f"{DIMAIL_URL}/allows/", auth=admin_auth, timeout=10)
    allows = response.json()
    assert len(allows) == 2
