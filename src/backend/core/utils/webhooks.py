"""
Utils to synchronize data with other services
"""

import json
import logging

from django.conf import settings

import requests

logger = logging.getLogger(__name__)

session = requests.Session()

# def get_serialized_team_memberships_to_synchronize(
#     self, team: models.Team, team_members_ids: list[str]) -> list[dict]:
#     """
#     Return a list of serialized team and team members to synchronize.

#     If team_members_ids is not provided, all listed team members linked to the provided
#     team will be returned. Otherwise, only listed team members with ids in
#     team_users_ids will be returned.
#     """
#     filters = {"team": team, "is_listed": True}

#     if team_members_ids:
#         filters["id__in"] = team_members_ids

#     return [
#         access.user.get_serialized()
#         for access in TeamAccess.objects.filter(**filters)
#     ]


def synchronize_team_members(serialized_team_members):
    "webhook to synchronize data"

    if not settings.TEAM_WEBHOOKS or not serialized_team_members:
        return

    json_teams_members = json.dumps(serialized_team_members).encode("utf-8")
    for webhook in settings.TEAM_WEBHOOKS:
        try:
            response = session.post(
                webhook["url"],
                json=serialized_team_members,
                # headers={"Authorization": f"SIG-HMAC-SHA256 {signature:s}"},
                verify=bool(webhook.get("verify", True)),
                timeout=3,
            )
        except requests.exceptions.RetryError as exc:
            logger.error(
                "Synchronization failed due to max retries exceeded with url %s",
                webhook["url"],
                exc_info=exc,
            )
        except requests.exceptions.RequestException as exc:
            logger.error(
                "Synchronization failed with %s.",
                webhook["url"],
                exc_info=exc,
            )
        else:
            extra = {
                "sent": json_teams_members,
                "response": response.content,
            }
            # pylint: disable=no-member
            if response.status_code == requests.codes.ok:
                logger.info(
                    "Synchronization succeeded with %s",
                    webhook["url"],
                    extra=extra,
                )
            else:
                logger.error(
                    "Synchronization failed with %s",
                    webhook["url"],
                    extra=extra,
                )
