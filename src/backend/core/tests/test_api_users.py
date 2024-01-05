"""
Test users API endpoints in the People core app.
"""
import pytest
from rest_framework.test import APIClient

from core import factories, models
from core.api import serializers

from .utils import OIDCToken

pytestmark = pytest.mark.django_db


def test_api_users_list_anonymous():
    """Anonymous users should not be allowed to list users."""
    factories.UserFactory()
    client = APIClient()
    response = client.get("/api/v1.0/users/")
    assert response.status_code == 404
    assert "Not Found" in response.content.decode("utf-8")


def test_api_users_list_authenticated():
    """
    Authenticated users should not be able to list users.
    """
    identity = factories.IdentityFactory()
    jwt_token = OIDCToken.for_user(identity.user)

    factories.UserFactory.create_batch(2)
    response = APIClient().get(
        "/api/v1.0/users/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
    )
    assert response.status_code == 404
    assert "Not Found" in response.content.decode("utf-8")


def test_api_users_retrieve_me_anonymous():
    """Anonymous users should not be allowed to list users."""
    factories.UserFactory.create_batch(2)
    client = APIClient()
    response = client.get("/api/v1.0/users/me/")
    assert response.status_code == 401
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }


def test_api_users_retrieve_me_authenticated():
    """Authenticated users should be able to retrieve their own user via the "/users/me" path."""
    identity = factories.IdentityFactory()
    user = identity.user
    jwt_token = OIDCToken.for_user(user)

    # Define profile contact
    contact = factories.ContactFactory(owner=user)
    user.profile_contact = contact
    user.save()

    factories.UserFactory.create_batch(2)
    response = APIClient().get(
        "/api/v1.0/users/me/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": str(user.id),
        "language": user.language,
        "timezone": str(user.timezone),
        "is_device": False,
        "is_staff": False,
        "data": user.profile_contact.data,
    }


def test_api_users_retrieve_anonymous():
    """Anonymous users should not be allowed to retrieve a user."""
    client = APIClient()
    user = factories.UserFactory()
    response = client.get(f"/api/v1.0/users/{user.id!s}/")

    assert response.status_code == 401
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }


def test_api_users_retrieve_authenticated_self():
    """
    Authenticated users should be allowed to retrieve their own user.
    The returned object should not contain the password.
    """
    identity = factories.IdentityFactory()
    user = identity.user
    jwt_token = OIDCToken.for_user(user)

    response = APIClient().get(
        f"/api/v1.0/users/{user.id!s}/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
    )
    assert response.status_code == 405
    assert response.json() == {"detail": 'Method "GET" not allowed.'}


def test_api_users_retrieve_authenticated_other():
    """
    Authenticated users should be able to retrieve another user's detail view with
    limited information.
    """
    identity = factories.IdentityFactory()
    jwt_token = OIDCToken.for_user(identity.user)

    other_user = factories.UserFactory()

    response = APIClient().get(
        f"/api/v1.0/users/{other_user.id!s}/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
    )
    assert response.status_code == 405
    assert response.json() == {"detail": 'Method "GET" not allowed.'}


def test_api_users_create_anonymous():
    """Anonymous users should not be able to create users via the API."""
    response = APIClient().post(
        "/api/v1.0/users/",
        {
            "language": "fr-fr",
            "password": "mypassword",
        },
    )
    assert response.status_code == 404
    assert "Not Found" in response.content.decode("utf-8")
    assert models.User.objects.exists() is False


def test_api_users_create_authenticated():
    """Authenticated users should not be able to create users via the API."""
    identity = factories.IdentityFactory()
    user = identity.user
    jwt_token = OIDCToken.for_user(user)

    response = APIClient().post(
        "/api/v1.0/users/",
        {
            "language": "fr-fr",
            "password": "mypassword",
        },
        format="json",
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )
    assert response.status_code == 404
    assert "Not Found" in response.content.decode("utf-8")
    assert models.User.objects.exclude(id=user.id).exists() is False


def test_api_users_update_anonymous():
    """Anonymous users should not be able to update users via the API."""
    user = factories.UserFactory()

    old_user_values = dict(serializers.UserSerializer(instance=user).data)
    new_user_values = serializers.UserSerializer(instance=factories.UserFactory()).data

    response = APIClient().put(
        f"/api/v1.0/users/{user.id!s}/",
        new_user_values,
        format="json",
    )

    assert response.status_code == 401
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }

    user.refresh_from_db()
    user_values = dict(serializers.UserSerializer(instance=user).data)
    for key, value in user_values.items():
        assert value == old_user_values[key]


def test_api_users_update_authenticated_self():
    """
    Authenticated users should be able to update their own user but only "language"
    and "timezone" fields.
    """
    identity = factories.IdentityFactory()
    user = identity.user
    jwt_token = OIDCToken.for_user(user)

    old_user_values = dict(serializers.UserSerializer(instance=user).data)
    new_user_values = dict(
        serializers.UserSerializer(instance=factories.UserFactory()).data
    )

    response = APIClient().put(
        f"/api/v1.0/users/{user.id!s}/",
        new_user_values,
        format="json",
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )

    assert response.status_code == 200
    user.refresh_from_db()
    user_values = dict(serializers.UserSerializer(instance=user).data)
    for key, value in user_values.items():
        if key in ["language", "timezone"]:
            assert value == new_user_values[key]
        else:
            assert value == old_user_values[key]


def test_api_users_update_authenticated_other():
    """Authenticated users should not be allowed to update other users."""
    identity = factories.IdentityFactory()
    jwt_token = OIDCToken.for_user(identity.user)

    user = factories.UserFactory()
    old_user_values = dict(serializers.UserSerializer(instance=user).data)
    new_user_values = serializers.UserSerializer(instance=factories.UserFactory()).data

    response = APIClient().put(
        f"/api/v1.0/users/{user.id!s}/",
        new_user_values,
        format="json",
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )

    assert response.status_code == 403
    user.refresh_from_db()
    user_values = dict(serializers.UserSerializer(instance=user).data)
    for key, value in user_values.items():
        assert value == old_user_values[key]


def test_api_users_patch_anonymous():
    """Anonymous users should not be able to patch users via the API."""
    user = factories.UserFactory()

    old_user_values = dict(serializers.UserSerializer(instance=user).data)
    new_user_values = dict(
        serializers.UserSerializer(instance=factories.UserFactory()).data
    )

    for key, new_value in new_user_values.items():
        response = APIClient().patch(
            f"/api/v1.0/users/{user.id!s}/",
            {key: new_value},
            format="json",
        )
        assert response.status_code == 401
        assert response.json() == {
            "detail": "Authentication credentials were not provided."
        }

    user.refresh_from_db()
    user_values = dict(serializers.UserSerializer(instance=user).data)
    for key, value in user_values.items():
        assert value == old_user_values[key]


def test_api_users_patch_authenticated_self():
    """
    Authenticated users should be able to patch their own user but only "language"
    and "timezone" fields.
    """
    identity = factories.IdentityFactory()
    user = identity.user
    jwt_token = OIDCToken.for_user(user)

    old_user_values = dict(serializers.UserSerializer(instance=user).data)
    new_user_values = dict(
        serializers.UserSerializer(instance=factories.UserFactory()).data
    )

    for key, new_value in new_user_values.items():
        response = APIClient().patch(
            f"/api/v1.0/users/{user.id!s}/",
            {key: new_value},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        assert response.status_code == 200

    user.refresh_from_db()
    user_values = dict(serializers.UserSerializer(instance=user).data)
    for key, value in user_values.items():
        if key in ["language", "timezone"]:
            assert value == new_user_values[key]
        else:
            assert value == old_user_values[key]


def test_api_users_patch_authenticated_other():
    """Authenticated users should not be allowed to patch other users."""
    identity = factories.IdentityFactory()
    jwt_token = OIDCToken.for_user(identity.user)

    user = factories.UserFactory()
    old_user_values = dict(serializers.UserSerializer(instance=user).data)
    new_user_values = dict(
        serializers.UserSerializer(instance=factories.UserFactory()).data
    )

    for key, new_value in new_user_values.items():
        response = APIClient().put(
            f"/api/v1.0/users/{user.id!s}/",
            {key: new_value},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        assert response.status_code == 403

    user.refresh_from_db()
    user_values = dict(serializers.UserSerializer(instance=user).data)
    for key, value in user_values.items():
        assert value == old_user_values[key]


def test_api_users_delete_list_anonymous():
    """Anonymous users should not be allowed to delete a list of users."""
    factories.UserFactory.create_batch(2)

    client = APIClient()
    response = client.delete("/api/v1.0/users/")

    assert response.status_code == 404
    assert models.User.objects.count() == 2


def test_api_users_delete_list_authenticated():
    """Authenticated users should not be allowed to delete a list of users."""
    factories.UserFactory.create_batch(2)
    identity = factories.IdentityFactory()
    jwt_token = OIDCToken.for_user(identity.user)

    client = APIClient()
    response = client.delete(
        "/api/v1.0/users/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
    )

    assert response.status_code == 404
    assert models.User.objects.count() == 3


def test_api_users_delete_anonymous():
    """Anonymous users should not be allowed to delete a user."""
    user = factories.UserFactory()

    response = APIClient().delete(f"/api/v1.0/users/{user.id!s}/")

    assert response.status_code == 401
    assert models.User.objects.count() == 1


def test_api_users_delete_authenticated():
    """
    Authenticated users should not be allowed to delete a user other than themselves.
    """
    identity = factories.IdentityFactory()
    jwt_token = OIDCToken.for_user(identity.user)
    other_user = factories.UserFactory()

    response = APIClient().delete(
        f"/api/v1.0/users/{other_user.id!s}/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
    )

    assert response.status_code == 405
    assert models.User.objects.count() == 2


def test_api_users_delete_self():
    """Authenticated users should not be able to delete their own user."""
    identity = factories.IdentityFactory()
    jwt_token = OIDCToken.for_user(identity.user)

    response = APIClient().delete(
        f"/api/v1.0/users/{identity.user.id!s}/",
        HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
    )

    assert response.status_code == 405
    assert models.User.objects.count() == 1
