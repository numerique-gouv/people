"""Resource Server utils functions"""

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from joserfc.jwk import JWKRegistry


def import_private_key_from_settings():
    """Import the private key used by the resource server when interacting with the OIDC provider.

    This private key is crucial; its public components are exposed in the JWK endpoints,
    while its private component is used for decrypting the introspection token retrieved
    from the OIDC provider.

    By default, we recommend using RSAKey for asymmetric encryption,
    known for its strong security features.

    Note:
        - The function requires the 'RESOURCE_SERVER_JWK_PRIVATE_KEY_STR' setting to be configured.
        - The 'RESOURCE_SERVER_JWK_KEY_TYPE' and 'RESOURCE_SERVER_JWK_ALG' settings can be customized
          based on the chosen key type.

    Raises:
        ImproperlyConfigured: If the private key setting is missing, empty, or incorrect.

    Returns:
        joserfc.jwk.JWK: The imported private key as a JWK object.
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

    return private_key
