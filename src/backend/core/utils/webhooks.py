# from https://github.com/openfun/joanie/blob/ea1857dd33e79bb34d56b93fcb81b92303886b42/src/backend/joanie/core/utils/webhooks.py#L31


def get_serialized_team_memberships_to_synchronize(
    self, team: models.Team, team_members_ids: list[str]) -> list[dict]:
    """
    Return a list of serialized team and team members to synchronize.

    If team_members_ids is not provided, all listed team members linked to the provided
    team will be returned. Otherwise, only listed team members with ids in
    team_users_ids will be returned.
    """
    filters = {"team": team, "is_listed": True}

    if team_members_ids:
        filters["id__in"] = team_members_ids

    return [
        access.user.get_serialized()
        for access in TeamAccess.objects.filter(**filters)
    ]


def synchronize_team_memberships(serialized_team_memberships):
    "webhook to synchronize data"

    if not settings.TEAM_WEBHOOKS or nor serialized_team_memberships:
        return

    json_course_runs = json.dumps(serialized_team_memberships).encode("utf-8")
    for webhook in settings.TEAM_WEBHOOKS:

        try:
            response = session.post(
                webhook["url"],
                json=serialized_course_runs,
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
                "sent": json_course_runs,
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

