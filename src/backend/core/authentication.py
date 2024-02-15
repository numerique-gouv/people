"""Authentication for the People core app."""

import logging

from django.db import models
from django.utils.translation import gettext_lazy as _

import requests
from mozilla_django_oidc.auth import (
    OIDCAuthenticationBackend as MozillaOIDCAuthenticationBackend,
)
from rest_framework_simplejwt.exceptions import InvalidToken

from .models import Identity

LOGGER = logging.getLogger(__name__)


class OIDCAuthenticationBackend(MozillaOIDCAuthenticationBackend):
    """Custom OpenID Connect (OIDC) Authentication Backend.

    This class overrides the default OIDC Authentication Backend to accommodate differences
    in the User and Identity models, as well as the userinfo endpoint behavior in Agent Connect.
    """

    def get_userinfo(self, access_token, id_token, payload):
        """Return user details dictionary.

        Parameters:
        - access_token (str): The access token.
        - id_token (str): The id token (unused).
        - payload (dict): The token payload (unused).

        Note: The id_token and payload parameters are unused in this implementation,
        but were kept to preserve base method signature.

        Note: Userinfo endpoint returns a signed JWT, and not 'application/json'. This
        constraint comes from Agent Connect. It forces us to override the base method,
        which deal with 'application/json' response.

        Returns:
        - dict: User details dictionary obtained from the OpenID Connect user endpoint.
        """

        user_response = requests.get(
            self.OIDC_OP_USER_ENDPOINT,
            headers={"Authorization": f"Bearer {access_token}"},
            verify=self.get_settings("OIDC_VERIFY_SSL", True),
            timeout=self.get_settings("OIDC_TIMEOUT", None),
            proxies=self.get_settings("OIDC_PROXY", None),
        )
        user_response.raise_for_status()
        userinfo = self.verify_token(user_response.text)
        return userinfo

    def get_or_create_user(self, access_token, id_token, payload):
        """Return a User based on userinfo. Get or create a new user if no user matches the Sub.

        Parameters:
        - access_token (str): The access token.
        - id_token (str): The ID token.
        - payload (dict): The user payload.

        Returns:
        - User: An existing or newly created User instance.

        Raises:
        - Exception: Raised when user creation is not allowed and no existing user is found.
        """

        user_info = self.get_userinfo(access_token, id_token, payload)

        email = user_info.get("email")
        sub = user_info.get("sub")

        if sub is None:
            raise InvalidToken(
                _("User info contained no recognizable user identification")
            )

        user = (
            self.UserModel.objects.filter(identities__sub=sub)
            .annotate(identity_email=models.F("identities__email"))
            .distinct()
            .first()
        )

        if user:
            if email and email != user.identity_email:
                Identity.objects.filter(sub=sub).update(email=email)

        elif self.get_settings("OIDC_CREATE_USER", True):
            user = self.create_user(user_info)

        return user

    def create_user(self, claims):
        """Return a newly created User instance."""

        email = claims.get("email")
        sub = claims.get("sub")

        if sub is None:
            raise InvalidToken(
                _("Claims contained no recognizable user identification")
            )

        user = self.UserModel.objects.create(password="!", email=email)  # noqa: S106
        Identity.objects.create(user=user, sub=sub, email=email)

        return user
