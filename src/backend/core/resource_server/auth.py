"""Resource Server authentication class"""

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


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

    def authenticate(self, request):
        """Authenticate the request using an access token issued by the OIDC provider"""

        access_token = request.GET.get("access_token")
        if not access_token:
            raise AuthenticationFailed("No access token provided.")

        # todo: call introspection endpoint from the service provider
        # todo: replace by the user
        print('authenticate')
        return None
