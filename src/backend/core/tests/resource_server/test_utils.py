"""
Test for the Resource Server (RS) utils functions.
"""

from django.core.exceptions import ImproperlyConfigured
from django.test.utils import override_settings

import pytest
from joserfc.jwk import ECKey, RSAKey

from core.resource_server.utils import import_private_key_from_settings


@pytest.mark.parametrize("mocked_private_key", [None, ""])
def test_import_private_key_from_settings_missing_or_empty_key(
    settings, mocked_private_key
):
    """Should raise an exception if the settings 'OIDC_RS_PRIVATE_KEY_STR' is missing or empty."""
    settings.OIDC_RS_PRIVATE_KEY_STR = mocked_private_key

    with pytest.raises(
        ImproperlyConfigured,
        match="OIDC_RS_PRIVATE_KEY_STR setting is missing or empty.",
    ):
        import_private_key_from_settings()


@pytest.mark.parametrize("mocked_private_key", ["123", "foo", "invalid_key"])
@override_settings(OIDC_RS_ENCRYPTION_KEY_TYPE="RSA")
@override_settings(OIDC_RS_ENCRYPTION_ALGO="RS256")
def test_import_private_key_from_settings_incorrect_key(settings, mocked_private_key):
    """Should raise an exception if the setting 'OIDC_RS_PRIVATE_KEY_STR' has an incorrect value."""
    settings.OIDC_RS_PRIVATE_KEY_STR = mocked_private_key

    with pytest.raises(
        ImproperlyConfigured, match="OIDC_RS_PRIVATE_KEY_STR setting is wrong."
    ):
        import_private_key_from_settings()


@override_settings(OIDC_RS_ENCRYPTION_KEY_TYPE="RSA")
@override_settings(OIDC_RS_ENCRYPTION_ALGO="RS256")
def test_import_private_key_from_settings_success_rsa_key():
    """Should import private key string as an RSA key."""
    private_key = import_private_key_from_settings()
    assert isinstance(private_key, RSAKey)


@override_settings(OIDC_RS_ENCRYPTION_KEY_TYPE="EC")
@override_settings(OIDC_RS_ENCRYPTION_ALGO="ES256")
def test_import_private_key_from_settings_success_ec_key():
    """Should import private key string as an EC key."""
    private_key = import_private_key_from_settings()
    assert isinstance(private_key, ECKey)
