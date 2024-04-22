"""Resource Server views"""

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from joserfc.jwk import JWKRegistry, KeySet
from rest_framework.response import Response
from rest_framework.views import APIView


class JWKSView(APIView):
    """
    API endpoint for retrieving a JSON Web Key (JWK).

    Returns:
        Response: JSON response containing the JWK data.
    """

    authentication_classes = []  # disable authentication
    permission_classes = []  # disable permission

    def get(self, request):
        """Handle GET requests to retrieve the JSON Web Key (JWK).

        Returns:
            Response: JSON response containing the JWK data.
        """

        private_key_str = settings.RESOURCE_SERVER_JWK_PRIVATE_KEY_STR

        if not private_key_str:
            raise ImproperlyConfigured(
                "RESOURCE_SERVER_JWK_PRIVATE_KEY_STR setting is missing or empty."
            )

        private_key_pem = private_key_str.encode()

        try:
            private_key = JWKRegistry.import_key(
                private_key_pem,
                key_type=settings.RESOURCE_SERVER_JWK_KEY_TYPE,
                parameters={"alg": settings.RESOURCE_SERVER_JWK_ALG, "use": "enc"},
            )
        except ValueError as err:
            raise ImproperlyConfigured(
                "RESOURCE_SERVER_JWK_PRIVATE_KEY_STR setting is wrong."
            ) from err

        jwk = KeySet([private_key]).as_dict()

        return Response(jwk)
