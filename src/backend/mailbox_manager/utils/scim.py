"""A minimalist SCIM client to synchronize with remote service providers."""

import logging

import requests
from urllib3.util import Retry

logger = logging.getLogger(__name__)

adapter = requests.adapters.HTTPAdapter(
    max_retries=Retry(
        total=4,
        backoff_factor=0.1,
        status_forcelist=[500, 502],
        allowed_methods=["PATCH"],
    )
)

session = requests.Session()
session.mount("http://", adapter)
# session.mount("https://", adapter)


class SCIMClient:
    """A minimalist SCIM client for our needs."""

    def create_mailbox(self, webhook, identifier):
        """Create a mailbox on webhook's domain."""

        payload = {
            "email": f"{identifier}@{webhook.domain}",
            "givenName": identifier,
            "surName": "Test",
            "displayName": f"{identifier} Test",
        }
        print(f"Sending payload", payload)

        return session.post(
            webhook.url,
            json=payload,
            headers=webhook.get_headers(),
            # verify=False,
            verify=True,
            # verify=self.get_settings("OIDC_VERIFY_SSL", True),
            timeout=10,
        )
