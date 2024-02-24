"""
Unit tests for the User model
"""
from unittest import mock

from django.core.exceptions import ValidationError

import pytest

from core import factories, models

pytestmark = pytest.mark.django_db


def test_models_users_str():
    """The str representation should be the email."""
    user = factories.UserFactory(email="david.bowman@gmail.com")
    user.save()

    assert str(user) == "david.bowman@gmail.com"


def test_models_users_id_unique():
    """The "id" field should be unique."""
    user = factories.UserFactory()
    with pytest.raises(ValidationError, match="User with this Id already exists."):
        factories.UserFactory(id=user.id)


def test_models_users_email_unique():
    """The "email" field should be unique except for the null value."""
    user = factories.UserFactory()
    with pytest.raises(
        ValidationError, match="User with this Email address already exists."
    ):
        factories.UserFactory(email=user.email)


def test_models_users_email_several_null():
    """Several users with a null value for the "email" field can co-exist."""
    factories.UserFactory(email=None)
    factories.UserFactory(email=None)

    assert models.User.objects.filter(email__isnull=True).count() == 2



def test_models_users_send_mail_main_existing():
    """The 'email_user' method should send mail to the user's main email address."""
    main_email = factories.IdentityFactory(email="dave@example.com")
    user = main_email.user
    factories.IdentityFactory.create_batch(2, user=user)

    with mock.patch("django.core.mail.send_mail") as mock_send:
        user.email_user("my subject", "my message")

    mock_send.assert_called_once_with(
        "my subject", "my message", None, ["dave@example.com"]
    )


def test_models_users_send_mail_main_missing():
    """The 'email_user' method should fail if the user has no email address."""
    user = factories.UserFactory()

    with pytest.raises(models.Identity.DoesNotExist) as excinfo:
        user.email_user("my subject", "my message")

    assert str(excinfo.value) == "Identity matching query does not exist."
