"""Test the `setup_dimail_db` management command"""

from django.core.management import call_command
from django.test import override_settings
from django.contrib.auth import get_user_model


import pytest
import requests

from mailbox_manager.management.commands.setup_dimail_db import DIMAIL_URL, admin

pytestmark = pytest.mark.django_db

admin_auth = (admin["username"], admin["password"])
User = get_user_model()


@override_settings(DEBUG=True)
def test_commands_setup_dimail_db():
    """The create_demo management command should create objects as expected."""
    call_command("setup_dimail_db")

    # check created users
    response = requests.get(url=f"{DIMAIL_URL}/users/", auth=admin_auth, timeout=10)
    users = response.json()

    # if John Doe exists, we created a dimail user for them
    local_user = User.objects.filter(name="John Doe").exists()

    assert len(users) == 3 if local_user else 2
    [user.pop("uuid") for user in users] # remove uuid because we cannot devine them

    if local_user:
        assert users.pop() == {
            "is_admin": False,
            "name": User.objects.get(name="John Doe").uuid,
            "perms": [],
        }
    assert users == [
        {
            "is_admin": True,
            "name": "admin",
            "perms": [],
        },
        {
            "is_admin": False,
            "name": "la_regie",
            "perms": [
                "new_domain",
                "create_users",
                "manage_users",
            ],
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
    assert len(allows) == 2 if local_user else 1
