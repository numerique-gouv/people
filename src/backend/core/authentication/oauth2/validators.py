"""
Module for OIDC authentication.

Contains all related code for OIDC authentication using
people as an Identity Provider.
"""

from oauth2_provider.oauth2_validators import OAuth2Validator


class BaseValidator(OAuth2Validator):
    """This validator adds additional claims to the token based on the requested scopes."""

    def get_additional_claims(self, request):
        """
        Generate additional claims to be included in the token.

        Args:
            request: The OAuth2 request object containing user and scope information.

        Returns:
            dict: A dictionary of additional claims to be included in the token.
        """
        additional_claims = super().get_additional_claims(request)

        # Enforce the use of the sub instead of the user pk as sub
        additional_claims["sub"] = request.user.sub

        # Authentication method reference
        additional_claims["amr"] = "pwd"

        # Include the user's name if 'profile' scope is requested
        if "profile" in request.scopes:
            additional_claims["name"] = request.user.name

        # Include the user's email if 'email' scope is requested
        if "email" in request.scopes:
            additional_claims["email"] = request.user.email

        return additional_claims

    def introspect_token(self, token, token_type_hint, request, *args, **kwargs):
        """Introspect an access or refresh token.

        Called once the introspect request is validated. This method should
        verify the *token* and either return a dictionary with the list of
        claims associated, or `None` in case the token is unknown.

        Below the list of registered claims you should be interested in:

        - scope : space-separated list of scopes
        - client_id : client identifier
        - username : human-readable identifier for the resource owner
        - token_type : type of the token
        - exp : integer timestamp indicating when this token will expire
        - iat : integer timestamp indicating when this token was issued
        - nbf : integer timestamp indicating when it can be "not-before" used
        - sub : subject of the token - identifier of the resource owner
        - aud : list of string identifiers representing the intended audience
        - iss : string representing issuer of this token
        - jti : string identifier for the token

        Note that most of them are coming directly from JWT RFC. More details
        can be found in `Introspect Claims`_ or `JWT Claims`_.

        The implementation can use *token_type_hint* to improve lookup
        efficiency, but must fallback to other types to be compliant with RFC.

        The dict of claims is added to request.token after this method.
        """
        claims = {}

        # Include the user's name if 'profile' scope is requested
        if claims and "profile" in claims["scope"]:
            claims["name"] = request.user.name

        # Include the user's email if 'email' scope is requested
        if claims and "email" in claims["scope"]:
            claims["email"] = request.user.email

        return claims

    def validate_silent_authorization(self, request):
        """Ensure the logged in user has authorized silent OpenID authorization.

        Silent OpenID authorization allows access tokens and id tokens to be
        granted to clients without any user prompt or interaction.

        :param request: OAuthlib request.
        :type request: oauthlib.common.Request
        :rtype: True or False

        Method is used by:
            - OpenIDConnectAuthCode
            - OpenIDConnectImplicit
            - OpenIDConnectHybrid
        """
        return request.user.is_authenticated

    def validate_silent_login(self, request):
        """Ensure session user has authorized silent OpenID login.

        If no user is logged in or has not authorized silent login, this
        method should return False.

        If the user is logged in but associated with multiple accounts and
        not selected which one to link to the token then this method should
        raise an oauthlib.oauth2.AccountSelectionRequired error.

        :param request: OAuthlib request.
        :type request: oauthlib.common.Request
        :rtype: True or False

        Method is used by:
            - OpenIDConnectAuthCode
            - OpenIDConnectImplicit
            - OpenIDConnectHybrid
        """
        return request.user.is_authenticated


class ProConnectValidator(BaseValidator):
    """
    This validator adds additional claims to be compatible with
    the french ProConnect API, but not only.
    """

    def get_additional_claims(self, request):
        """
        Generate additional claims to be included in the token.

        Args:
            request: The OAuth2 request object containing user and scope information.

        Returns:
            dict: A dictionary of additional claims to be included in the token.
        """
        additional_claims = super().get_additional_claims(request)

        # Include 'acr' claim if it is present in the request claims and equals 'eidas1'
        # see _create_authorization_code method for more details
        if request.claims and request.claims.get("acr") == "eidas1":
            additional_claims["acr"] = "eidas1"

        return additional_claims

    def _create_authorization_code(self, request, code, expires=None):
        """
        Create an authorization code and handle 'acr_values' in the request.

        Args:
            request: The OAuth2 request object containing user and scope information.
            code: The authorization code to be created.
            expires: The expiration time of the authorization code.

        Returns:
            The created authorization code.
        """
        # Split and strip 'acr_values' from the request, if present
        acr_values = (
            [value.strip() for value in request.acr_values.split(",")]
            if request.acr_values
            else []
        )

        # If 'eidas1' is in 'acr_values', add 'acr' claim to the request claims
        # This allows the token to have this information and pass it to the /token
        # endpoint and return it in the token response
        if "eidas1" in acr_values:
            request.claims = request.claims or {}
            request.claims["acr"] = "eidas1"

        # Call the superclass method to create the authorization code
        return super()._create_authorization_code(request, code, expires)
