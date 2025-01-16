"""Authentication backend for OIDC provider"""

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

UserModel = get_user_model()


class EmailModelBackend(ModelBackend):
    """Custom authentication backend for OIDC provider, enforce the use of email as the username"""

    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        """Authenticate a user based on email and password"""
        if username or email is None:  # ignore if username is provided
            return None
        try:
            user = UserModel.objects.get(email=email)
        except UserModel.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user (#20760).
            UserModel().set_password(password)
        else:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user

        return None

    def user_can_authenticate(self, user):
        """Check if the user can authenticate, do not allow admin or staff users here."""
        can_authenticate = super().user_can_authenticate(user)
        if not can_authenticate:
            return can_authenticate

        return bool(
            not getattr(user, "is_staff", True)
            and not getattr(user, "is_superuser", True)
        )
