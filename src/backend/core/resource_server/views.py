"""Resource Server views"""

from joserfc.jwk import KeySet
from rest_framework.response import Response
from rest_framework.views import APIView

from .utils import import_private_key_from_settings


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

        private_key = import_private_key_from_settings()
        jwk = KeySet([private_key]).as_dict()

        return Response(jwk)
