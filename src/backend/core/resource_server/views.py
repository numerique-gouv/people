"""Resource Server views"""

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
        # FIXME: Replace the mocked JWK data with actual JSON Web Key (JWK) data.
        jwk = {"jwk": [{"kid": "1", "alg": "RSA", "mod": "foo", "exp": "foo"}]}

        return Response(jwk)
