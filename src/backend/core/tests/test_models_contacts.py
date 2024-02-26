"""
Unit tests for the Contact model
"""
from django.core.exceptions import ValidationError

import pytest

from core import factories

pytestmark = pytest.mark.django_db


def test_models_contacts_str_full_name():
    """The str representation should be the contact's full name."""
    contact = factories.ContactFactory(full_name="David Bowman")
    assert str(contact) == "David Bowman"


def test_models_contacts_str_short_name():
    """The str representation should be the contact's short name if full name is not set."""
    contact = factories.ContactFactory(full_name=None, short_name="Dave")
    assert str(contact) == "Dave"


def test_models_contacts_bases_self():
    """A contact should not point to itself as a base contact."""
    contact = factories.ContactFactory()
    contact.bases.add(contact.owner)

    with pytest.raises(ValidationError) as excinfo:
        contact.save()

    error_message = (
        "{'bases': ['A contact should not point to its owner.']}"
    )
    assert str(excinfo.value) == error_message


def test_models_contacts_owner_bases_unique():
    """There should be only one contact deriving from a given base user for a given owner."""
    users = factories.UserFactory.create_batch(3)
    contact = factories.ContactFactory(bases=users)

    with pytest.raises(ValidationError) as excinfo:
        factories.ContactFactory(bases=[contact.bases.first()], owner=contact.owner)

    assert (
        str(excinfo.value)
        == "{'bases': ['Contacts with this Owner and Bases already exist.']}"
    )


def test_models_contacts_data_valid():
    """Contact information matching the jsonschema definition should be valid"""
    factories.ContactFactory(
        data={
            "emails": [
                {"type": "Work", "value": "john.doe@work.com"},
                {"type": "Home", "value": "john.doe@home.com"},
            ],
            "phones": [
                {"type": "Work", "value": "(123) 456-7890"},
                {"type": "Other", "value": "(987) 654-3210"},
            ],
            "addresses": [
                {
                    "type": "Home",
                    "street": "123 Main St",
                    "city": "Cityville",
                    "state": "CA",
                    "zip": "12345",
                    "country": "USA",
                }
            ],
            "links": [
                {"type": "Blog", "value": "http://personalwebsite.com"},
                {"type": "Website", "value": "http://workwebsite.com"},
                {"type": "LinkedIn", "value": "https://www.linkedin.com/in/johndoe"},
                {"type": "Facebook", "value": "https://www.facebook.com/in/johndoe"},
            ],
            "customFields": {"custom_field_1": "value1", "custom_field_2": "value2"},
            "organizations": [
                {
                    "name": "ACME Corporation",
                    "department": "IT",
                    "jobTitle": "Software Engineer",
                },
                {
                    "name": "XYZ Ltd",
                    "department": "Marketing",
                    "jobTitle": "Marketing Specialist",
                },
            ],
        }
    )


def test_models_contacts_data_invalid():
    """Invalid contact information should be rejected with a clear error message."""
    with pytest.raises(ValidationError) as excinfo:
        factories.ContactFactory(
            data={
                "emails": [
                    {"type": "invalid type", "value": "john.doe@work.com"},
                ],
            }
        )

    assert str(excinfo.value) == (
        "{'data': [\"Validation error in 'emails.0.type': 'invalid type' is not one of ['Work', "
        "'Home', 'Other']\"]}"
    )
