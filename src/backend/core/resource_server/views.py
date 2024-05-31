"""Resource Server views"""

from joserfc.jwk import KeySet
from rest_framework.response import Response
from rest_framework.views import APIView

from .auth import ResourceServerAuthentication
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


# FIXME: temporary view
class DataView(APIView):
    """Temporary view to test resource server authentication."""

    authentication_classes = [ResourceServerAuthentication]
    permission_classes = []  # disable permission

    def get(self, request):
        """Temporary route to test resource server authentication."""
        token = request.auth
        if 'groups' in token.get('scope'):
            # TODO - return a proper error
            Response({'error scope "groups" not requested to the authorization server'})

        slugs = [team.slug for team in request.user.teams.all()]

        # TODO - use SCIM specification to exchange data
        return Response({
            "groups": slugs
        })
