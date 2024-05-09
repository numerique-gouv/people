"""Resource Server authentication class"""

from base64 import b64decode

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured, SuspiciousOperation

import requests
from joserfc import jwe, jwt
from joserfc.errors import InvalidClaimError
from joserfc.jwk import KeySet
from requests.exceptions import HTTPError
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from ..models import User
from .utils import import_private_key_from_settings


class ResourceServerAuthentication(BaseAuthentication):
    """Token-based authentication for Resource Server (RS).

    Authenticate by passing the access token received from the OIDC provider.
    The Resource Server will introspect the token, while the OIDC provider validates
    its integrity and permissions.
    """

    @staticmethod
    def get_settings(attr, *args):
        """Get the value of a setting from Django settings."""
        try:
            if args:
                return getattr(settings, attr, args[0])
            return getattr(settings, attr)
        except AttributeError as err:
            # FIXME: lint error C0209
            msg = "Setting {0} not found".format(attr)
            raise ImproperlyConfigured(msg) from err

    @staticmethod
    def decode_authorization_header(request):
        """Get access_token and received_secret passed by the Service Provider (SP)."""

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

        # FIXME: inherited from France Connect mock instance, bad practice
        # FIXME: a bearer token should respect format specified in the RFC
        authorization_data = decoded_bearer.split(":")
        if len(authorization_data) != 2:
            msg = "Token should contain an access_token and a received_secret."
            raise AuthenticationFailed(msg)

        access_token, received_secret = authorization_data

        return (access_token, received_secret)

    def authenticate(self, request):
        """Authenticate the request using an access token issued by the OIDC provider"""

        access_token, received_secret = self.decode_authorization_header(request)

        # FIXME: temporary authentication of services provider with a shared secret
        if received_secret != self.get_settings("OIDC_RS_AUTH_SECRET"):
            raise AuthenticationFailed("Invalid authentication secret")

        introspection_token = self.verify(access_token)

        active = introspection_token.get("active", None)

        if not active:
            raise AuthenticationFailed("Invalid access token: not active.")

        sub = introspection_token.get("sub", None)
        if sub is None:
            raise AuthenticationFailed("Invalid access token: missing sub.")

        user = User.objects.filter(identities__sub=sub).distinct().first()

        if user is None:
            raise AuthenticationFailed("Invalid access token: unknown user.")

        return (user, introspection_token)

    def verify(self, access_token):
        """Verify the access token to determine if it's still valid and active."""
        try:
            encrypted_token = self.retrieve_introspection_response(access_token)
        except HTTPError as err:
            raise AuthenticationFailed(
                "Failed to retrieve introspection token from the OIDC provider."
            ) from err

        resource_server_private_key = import_private_key_from_settings()
        encoded_token = self.decrypt(encrypted_token, resource_server_private_key)

        oidc_provider_public_keys = self.get_oidc_provider_public_keys()
        token = self.decode(encoded_token, oidc_provider_public_keys)

        self.validate_claims(token)

        return token.claims.get("token_introspection")

    def retrieve_introspection_response(self, access_token):
        """Retrieve information about an access token from the OIDC provider (OP).

        The introspection endpoint validates the integrity of the access token and provides
        authentication and authorization information for the user.

        Specifications are outlined in RFC 7662 (https://www.rfc-editor.org/info/rfc7662).
        """
        payload = {
            "client_id": self.get_settings("OIDC_RS_CLIENT_ID"),
            "client_secret": self.get_settings("OIDC_RS_CLIENT_SECRET"),
            "token": access_token,
        }
        response = requests.post(
            self.get_settings("OIDC_OP_TOKEN_INTROSPECTION_ENDPOINT"),
            data=payload,
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/token-introspection+jwt",
            },
            verify=self.get_settings("OIDC_VERIFY_SSL", True),
            timeout=self.get_settings("OIDC_TIMEOUT", None),
            proxies=self.get_settings("OIDC_PROXY", None),
        )
        response.raise_for_status()
        return response.text

    def retrieve_jwks(self):
        """Fetch the Json Web Key Set from the '/jwks' endpoint of the OIDC provider (OP)."""
        response = requests.get(
            self.get_settings("OIDC_OP_JWKS_ENDPOINT"),
            verify=self.get_settings("OIDC_VERIFY_SSL", True),
            timeout=self.get_settings("OIDC_TIMEOUT", None),
            proxies=self.get_settings("OIDC_PROXY", None),
        )
        response.raise_for_status()
        return response.json()

    def decrypt(self, encrypted_token, private_key):
        """Decrypt the token encrypted by the OIDC provider (OP).

        Resource Server (RS)'s public key is used for encryption, and its private
        key is used for decryption. The RS's public key is exposed to the OP via a JWK endpoint.

        Encryption Algorithm and Encoding should be configured to match between the OP
        and the RS.
        """
        try:
            decrypted_token = jwe.decrypt_compact(
                encrypted_token,
                private_key,
                algorithms=[
                    self.get_settings("OIDC_RS_ENCRYPTION_ENCODING"),
                    self.get_settings("OIDC_RS_ENCRYPTION_ALGO"),
                ],
            )
        except ValueError as err:
            msg = "Token decryption failed."
            raise SuspiciousOperation(msg) from err

        return decrypted_token

    def get_oidc_provider_public_keys(self):
        """Retrieve OIDC provider (OP) public keys from the '/jwks' endpoint."""
        try:
            oidc_provider_jwks = self.retrieve_jwks()
        except HTTPError as err:
            msg = "Failed to retrieve JWKs from the OIDC provider."
            raise AuthenticationFailed(msg) from err
        try:
            oidc_provider_public_keys = KeySet.import_key_set(oidc_provider_jwks)
        except ValueError as err:
            msg = "Failed to create a public key set from the OIDC Provider jwks."
            raise AuthenticationFailed(msg) from err

        return oidc_provider_public_keys

    def decode(self, encoded_token, public_key_set):
        """Decode the token signed by the OIDC provider (OP).

        OP's private key is used for signing, and its public key is used for decoding.
        The OP public key is exposed via a JWK endpoint.

        Signing Algorithm should be configured to match between the OP and the DP.
        """
        try:
            token = jwt.decode(
                encoded_token.plaintext,
                public_key_set,
                algorithms=[self.get_settings("OIDC_DP_SIGNING_ALGO")],
            )
        except ValueError as err:
            msg = "Token decoding failed."
            raise SuspiciousOperation(msg) from err

        return token

    def validate_claims(self, token):
        """Validate the claims of the token to ensure authentication security."""
        claims_requests = jwt.JWTClaimsRegistry(
            iss={"essential": True, "value": self.get_settings("OIDC_OP_ISSUER")},
            aud={"essential": True, "value": self.get_settings("OIDC_RS_CLIENT_ID")},
            token_introspection={"essential": True},
        )
        try:
            claims_requests.validate(token.claims)
        except InvalidClaimError as err:
            msg = "Failed to validate token's claims."
            raise SuspiciousOperation(msg) from err
