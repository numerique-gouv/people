"""
Test Synchronisation webhook in People's app.
"""

from django.test.utils import override_settings

import pytest
import responses

from core import factories
from core.api import serializers
from core.utils import webhooks

pytestmark = pytest.mark.django_db


def test_utils_webhooks_synchronize_teams__no_hook():
    """If no webhook is declared the function should not make any request."""

    team = factories.TeamFactory()
    users = [
        access.user for access in factories.TeamAccessFactory.create_batch(3, team=team)
    ]

    with override_settings(TEAM_WEBHOOKS=[]), responses.RequestsMock():
        webhooks.synchronize_team_members(serializers.UserSerializer(users, many=True))

    assert len(responses.calls) == 0
