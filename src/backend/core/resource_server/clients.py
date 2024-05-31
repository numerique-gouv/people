"""Resource Server client classes"""

from django.core.exceptions import ImproperlyConfigured, SuspiciousOperation

import requests
from joserfc import jwe as jose_jwe
from joserfc import jwt as jose_jwt
from joserfc.errors import InvalidClaimError
from joserfc.jwk import KeySet
from requests.exceptions import HTTPError
from rest_framework.exceptions import AuthenticationFailed

from .utils import import_private_key_from_settings


class AuthorizationServerClient:
    """Client for interacting with an OAuth 2.0 authorization server.

    An authorization server issues access tokens to client applications after authenticating
    and obtaining authorization from the resource owner. It also provides endpoints for token
    introspection and JSON Web Key Sets (JWKS) to validate and decode tokens.

    This client facilitates communication with the authorization server, including:
    - Fetching token introspection responses.
    - Retrieving JSON Web Key Sets (JWKS) for token validation.
    - Setting appropriate headers for secure communication as recommended by RFC drafts.
    """

    def __init__(
        self, endpoint_introspection, endpoint_jwks, url, verify_ssl, timeout, proxy
    ):
        self.url = url
        self._endpoint_introspection = endpoint_introspection
        self._endpoint_jwks = endpoint_jwks
        self._verify_ssl = verify_ssl
        self._timeout = timeout
        self._proxy = proxy

    @property
    def _introspection_headers(self):
        """Get HTTP header for the introspection request.

        Notify the authorization server that we expect a signed and encrypted response
        by setting the appropriate 'Accept' header. This follows the recommendation from
        the draft RFC (https://datatracker.ietf.org/doc/html/draft-ietf-oauth-jwt-introspection-response-12).
        """
        return {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/token-introspection+jwt",
        }

    def fetch_introspection(self, client_id, client_secret, token):
        """Retrieve introspection response about a token."""
        response = requests.post(
            self._endpoint_introspection,
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "token": token,
            },
            headers=self._introspection_headers,
            verify=self._verify_ssl,
            timeout=self._timeout,
            proxies=self._proxy,
        )
        response.raise_for_status()
        return response.text

    def fetch_jwks(self):
        """Fetch the Json Web Key Set from the jwks endpoint."""
        response = requests.get(
            self._endpoint_jwks,
            verify=self._verify_ssl,
            timeout=self._timeout,
            proxies=self._proxy,
        )
        response.raise_for_status()
        return response.json()

    def retrieve_public_keys(self):
        """Retrieve the public keys from the jwks endpoint."""
        try:
            jwks = self.fetch_jwks()
        except HTTPError as err:
            msg = "Failed to retrieve JWKs from the Authorization Server."
            raise AuthenticationFailed(msg) from err

        try:
            public_keys = KeySet.import_key_set(jwks)
        except ValueError as err:
            msg = (
                "Failed to create a public key set from the Authorization Server jwks."
            )
            raise AuthenticationFailed(msg) from err

        return public_keys


class ResourceServerClient:
    """Client for interacting with an OAuth 2.0 resource server.

    In the context of OAuth 2.0, a resource server is a server that hosts protected resources and
    is capable of accepting and responding to protected resource requests using access tokens.
    The resource server verifies the validity of the access tokens issued by the authorization
    server to ensure secure access to the resources.
    """

    def __init__(
        self,
        client_id,
        client_secret,
        encryption_encoding,
        encryption_algorithm,
        signing_algorithm,
        authorization_server,
    ):
        self._client_id = client_id
        self._client_secret = client_secret
        self._encryption_encoding = encryption_encoding
        self._encryption_algorithm = encryption_algorithm
        self._signing_algorithm = signing_algorithm
        self._authorization_server = authorization_server

    def verify(self, token):
        """Verify the token to determine if it's still valid and active.

        This method follows the specifications outlined in RFC 7662
        (https://www.rfc-editor.org/info/rfc7662) and the draft RFC
        (https://datatracker.ietf.org/doc/html/draft-ietf-oauth-jwt-introspection-response-12).

        In our eGovernment applications, the standard RFC 7662 does not provide sufficient security.
        Its introspection response is a plain JSON object. Therefore, we use the draft RFC that extends
        RFC 7662 by returning a signed and encrypted JWT for stronger assurance that the authorization
        server issued the token introspection response.
        """

        jwe = self._authorization_server.introspect_token(
            self._client_id,
            self._client_secret,
            token,
        )

        private_key = import_private_key_from_settings()
        jws = self._decrypt(jwe, private_key=private_key)

        jwt = self._decode(
            jws,
            public_key_set=self._authorization_server.retrieve_public_keys(),
        )

        self._validate_claims(jwt)
        introspection_response = jwt.claims.get("token_introspection")

        active = introspection_response.get("active", None)
        if not active:
            raise ValueError("Instrospection response is not active.")

        return introspection_response

    def _decrypt(self, encrypted_token, private_key):
        """Decrypt the token encrypted by the Authorization Server (AS).

        Resource Server (RS)'s public key is used for encryption, and its private
        key is used for decryption. The RS's public key is exposed to the AS via a JWK endpoint.

        Encryption Algorithm and Encoding should be configured to match between the AS
        and the RS.
        """
        try:
            decrypted_token = jose_jwe.decrypt_compact(
                encrypted_token,
                private_key,
                algorithms=[self._encryption_encoding, self._encryption_algorithm],
            )
        except ValueError as err:
            msg = "Token decryption failed."
            raise SuspiciousOperation(msg) from err

        return decrypted_token

    def _decode(self, encoded_token, public_key_set):
        """Decode the token signed by the Authorization Server (AS).

        AS's private key is used for signing, and its public key is used for decoding.
        The AS public key is exposed via a JWK endpoint.

        Signing Algorithm should be configured to match between the AS and the RS.
        """
        try:
            token = jose_jwt.decode(
                encoded_token.plaintext,
                public_key_set,
                algorithms=[self._signing_algorithm],
            )
        except ValueError as err:
            msg = "Token decoding failed."
            raise SuspiciousOperation(msg) from err

        return token

    def _validate_claims(self, token):
        """Validate the claims of the token to ensure authentication security.

        By validating these claims, we ensure that the token was issued by a
        trusted authorization server and is intended for this specific
        resource server. This prevents various types of attacks, such as
        token substitution or misuse of tokens issued for different clients.
        """
        claims_requests = jose_jwt.JWTClaimsRegistry(
            iss={"essential": True, "value": self._authorization_server.url},
            aud={"essential": True, "value": self._client_id},
            token_introspection={"essential": True},
        )

        try:
            claims_requests.validate(token.claims)
        except InvalidClaimError as err:
            msg = "Failed to validate token's claims."
            raise SuspiciousOperation(msg) from err
