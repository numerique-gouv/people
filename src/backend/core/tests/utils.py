"""Utils for tests in the People core application"""
from rest_framework_simplejwt.tokens import AccessToken


class OIDCToken(AccessToken):
    """Set payload on token from user/contact/email"""

    @classmethod
    def for_user(cls, user):
        """Returns an authorization token for the given user for testing."""
        identity = user.identities.filter(is_main=True).first()

        token = cls()
        token["first_name"] = (
            user.profile_contact.short_name if user.profile_contact else "David"
        )
        token["last_name"] = (
            " ".join(user.profile_contact.full_name.split()[1:])
            if user.profile_contact
            else "Bowman"
        )
        token["sub"] = str(identity.sub)
        token["email"] = user.email

        return token
