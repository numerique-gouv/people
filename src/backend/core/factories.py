# ruff: noqa: S311
"""
Core application factories
"""
from django.conf import settings
from django.contrib.auth.hashers import make_password

import factory.fuzzy
from faker import Faker

from core import models

fake = Faker()


class ContactFactory(factory.django.DjangoModelFactory):
    """Wip."""

    class Meta:
        model = models.Contact

    full_name = factory.Faker("name")
    short_name = factory.LazyAttributeSequence(
        lambda o, n: o.full_name.split()[0] if o.full_name else f"user{n!s}"
    )

    data = factory.Dict(
        {
            "emails": factory.LazyAttribute(
                lambda x: [
                    {
                        "type": fake.random_element(["Home", "Work", "Other"]),
                        "value": fake.email(),
                    }
                    for _ in range(fake.random_int(1, 3))
                ]
            ),
            "phones": factory.LazyAttribute(
                lambda x: [
                    {
                        "type": fake.random_element(
                            [
                                "Mobile",
                                "Home",
                                "Work",
                                "Main",
                                "Work Fax",
                                "Home Fax",
                                "Pager",
                                "Other",
                            ]
                        ),
                        "value": fake.phone_number(),
                    }
                    for _ in range(fake.random_int(1, 3))
                ]
            ),
            "addresses": factory.LazyAttribute(
                lambda x: [
                    {
                        "type": fake.random_element(["Home", "Work", "Other"]),
                        "street": fake.street_address(),
                        "city": fake.city(),
                        "state": fake.state(),
                        "zip": fake.zipcode(),
                        "country": fake.country(),
                    }
                    for _ in range(fake.random_int(1, 3))
                ]
            ),
            "links": factory.LazyAttribute(
                lambda x: [
                    {
                        "type": fake.random_element(
                            [
                                "Profile",
                                "Blog",
                                "Website",
                                "Twitter",
                                "Facebook",
                                "Instagram",
                                "LinkedIn",
                                "Other",
                            ]
                        ),
                        "value": fake.url(),
                    }
                    for _ in range(fake.random_int(1, 3))
                ]
            ),
            "customFields": factory.LazyAttribute(
                lambda x: {
                    f"custom_field_{i:d}": fake.word()
                    for i in range(fake.random_int(1, 3))
                },
            ),
            "organizations": factory.LazyAttribute(
                lambda x: [
                    {
                        "name": fake.company(),
                        "department": fake.word(),
                        "jobTitle": fake.job(),
                    }
                    for _ in range(fake.random_int(1, 3))
                ]
            ),
        }
    )

    owner = factory.SubFactory("core.factories.UserFactory")

    @factory.post_generation
    def bases(self, create, extracted, **kwargs):
        """Wip."""

        if create and extracted:
            self.bases.set(extracted)


class UserFactory(factory.django.DjangoModelFactory):
    """A factory to random users for testing purposes."""

    class Meta:
        model = models.User

    email = factory.Faker("email")
    language = factory.fuzzy.FuzzyChoice([lang[0] for lang in settings.LANGUAGES])
    password = make_password("password")


class IdentityFactory(factory.django.DjangoModelFactory):
    """A factory to create identities for a user"""

    class Meta:
        model = models.Identity
        django_get_or_create = ("sub",)

    user = factory.SubFactory(UserFactory)
    sub = factory.Sequence(lambda n: f"user{n!s}")
    email = factory.Faker("email")
    name = factory.Faker("name")


class TeamFactory(factory.django.DjangoModelFactory):
    """A factory to create teams"""

    class Meta:
        model = models.Team
        django_get_or_create = ("name",)

    name = factory.Sequence(lambda n: f"team{n}")

    @factory.post_generation
    def users(self, create, extracted, **kwargs):
        """Add users to team from a given list of users with or without roles."""
        if create and extracted:
            for item in extracted:
                if isinstance(item, models.User):
                    TeamAccessFactory(team=self, user=item)
                else:
                    TeamAccessFactory(team=self, user=item[0], role=item[1])


class TeamAccessFactory(factory.django.DjangoModelFactory):
    """Create fake team user accesses for testing."""

    class Meta:
        model = models.TeamAccess

    team = factory.SubFactory(TeamFactory)
    user = factory.SubFactory(UserFactory)
    role = factory.fuzzy.FuzzyChoice([r[0] for r in models.RoleChoices.choices])


class InvitationFactory(factory.django.DjangoModelFactory):
    """A factory to create invitations for a user"""

    class Meta:
        model = models.Invitation

    email = factory.Faker("email")
    team = factory.SubFactory(TeamFactory)
    role = factory.fuzzy.FuzzyChoice([role[0] for role in models.RoleChoices.choices])
    issuer = factory.SubFactory(UserFactory)
