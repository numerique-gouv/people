"""Resource Server authentication class"""

from base64 import b64decode

from requests.exceptions import HTTPError
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from ..models import User
from .clients import AuthorizationServerClient, ResourceServerClient
from .utils import get_settings


class ResourceServerAuthentication(BaseAuthentication):
    """Token-based authentication for Resource Server (RS).

    Authenticate by passing the token received from the OIDC Provider (OP).
    The Resource Server will introspect the token, while the OIDC Provider validates
    its integrity and permissions.
    """

    @staticmethod
    def _decode_authorization_header(request):
        """Get token and received_secret passed by the Service Provider (SP)."""

        authorization_header = get_authorization_header(request).split()

        if (
            not authorization_header
            or authorization_header[0].lower() != "Bearer".lower().encode()
        ):
            msg = "Invalid token header. No credentials provided."
            raise AuthenticationFailed(msg)

        if len(authorization_header) == 1:
            msg = "Invalid token header. No credentials provided."
            raise AuthenticationFailed(msg)

        if len(authorization_header) > 2:
            msg = "Invalid token header. Token string should not contain spaces."
            raise AuthenticationFailed(msg)

        decoded_bearer = b64decode(authorization_header[1]).decode("utf-8")

        # FIXME: inherited from France Connect mocked RS, bad practice, a bearer token should respect format specified in the RFC
        authorization_data = decoded_bearer.split(":")
        if len(authorization_data) != 2:
            msg = "Token should contain a token and a received_secret."
            raise AuthenticationFailed(msg)

        token, received_secret = authorization_data

        return (token, received_secret)

    @staticmethod
    def authenticate_service_provider(received_secret):
        """Authenticate the Service Provider (SP) with a shared secret.

        This method is temporary, and inspired by Agent Connect mocked resource servers.
        """
        if received_secret != get_settings("OIDC_RS_AUTH_SECRET"):
            raise AuthenticationFailed("Invalid authentication secret")

    @staticmethod
    def _get_user(introspection_response):
        """Retrieve the user associated with the given token introspection response."""

        sub = introspection_response.get("sub", None)
        if sub is None:
            raise AuthenticationFailed(
                "Introspection response lacks a subject identifier (sub)."
            )

        user = User.objects.filter(identities__sub=sub).distinct().first()

        if user is None:
            raise AuthenticationFailed(
                "No user found for the given subject identifier (sub)."
            )

        return sub

    def authenticate(self, request):
        """Authenticate the request using a token issued by the OIDC Provider (OP)"""

        access_token, received_secret = self._decode_authorization_header(request)
        self.authenticate_service_provider(received_secret)

        authorization_server = AuthorizationServerClient(
            endpoint_introspection=get_settings("OIDC_OP_TOKEN_INTROSPECTION_ENDPOINT"),
            endpoint_jwks=get_settings("OIDC_OP_TOKEN_JWKS_ENDPOINT"),
            url=get_settings("OIDC_OP_URL"),
            verify_ssl=get_settings("OIDC_VERIFY_SSL", True),
            timeout=get_settings("OIDC_TIMEOUT", False),
            proxy=get_settings("OIDC_PROXY", True),
        )

        resource_server = ResourceServerClient(
            client_id=get_settings("OIDC_RS_CLIENT_ID"),
            client_secret=get_settings("OIDC_RS_CLIENT_SECRET"),
            encryption_encoding=get_settings("OIDC_RS_ENCRYPTION_ENCODING"),
            encryption_algorithm=get_settings("OIDC_RS_ENCRYPTION_ALGO"),
            signing_algorithm=get_settings("OIDC_RS_SIGNING_ALGO"),
            authorization_server=authorization_server,
        )

        try:
            introspection_response = resource_server.verify(access_token)
        except HTTPError as err:
            raise AuthenticationFailed(
                "Could not fetch introspection response"
            ) from err
        except ValueError as err:
            raise AuthenticationFailed("introspection response is not active") from err

        user = self._get_user(introspection_response)

        return (user, introspection_response)
