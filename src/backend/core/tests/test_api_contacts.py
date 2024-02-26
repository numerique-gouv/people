"""
Test contacts API endpoints in People's core app.
"""
from django.test.utils import override_settings

import pytest
from rest_framework.test import APIClient

from core import factories, models
from core.api import serializers

pytestmark = pytest.mark.django_db


CONTACT_DATA = {
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


def test_api_contacts_list_anonymous():
    """Anonymous users should not be allowed to list contacts."""
    factories.ContactFactory.create_batch(2)

    response = APIClient().get("/api/v1.0/contacts/")

    assert response.status_code == 401
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }


def test_api_contacts_list_authenticated_no_query():
    """
    Authenticated users should be able to list contacts without applying a query.
    Only their contacts should be listed.
    """
    identity = factories.IdentityFactory()
    user = identity.user

    base_users = factories.UserFactory.create_batch(5)

    # Let's have 5 contacts in database:
    factories.ContactFactory.create_batch(5)  # Excluded because belongs to other users

    contact2 = factories.ContactFactory(
        bases=base_users, owner=user, full_name="Bernard"
    )  # Included

    client = APIClient()
    client.force_login(user)

    response = client.get("/api/v1.0/contacts/")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": str(contact2.id),
            "bases": [str(u.id) for u in base_users],
            "owner": str(contact2.owner.id),
            "data": contact2.data,
            "full_name": contact2.full_name,
            "short_name": contact2.short_name,
        },
    ]


def test_api_contacts_list_authenticated_by_full_name():
    """
    Authenticated users should be able to search users with a case insensitive and
    partial query on the full name.
    """
    identity = factories.IdentityFactory()
    user = identity.user

    dave = factories.ContactFactory(full_name="David Bowman", owner=user)
    nicole = factories.ContactFactory(full_name="Nicole Foole", owner=user)
    frank = factories.ContactFactory(full_name="Frank Poole", owner=user)
    factories.ContactFactory(full_name="Heywood Floyd", owner=user)

    # Full query should work
    client = APIClient()
    client.force_login(user)

    response = client.get("/api/v1.0/contacts/?q=David%20Bowman")

    assert response.status_code == 200
    contact_ids = [contact["id"] for contact in response.json()]
    assert contact_ids == [str(dave.id)]

    # Partial query should work
    response = client.get("/api/v1.0/contacts/?q=ank")

    assert response.status_code == 200
    contact_ids = [contact["id"] for contact in response.json()]
    assert contact_ids == [str(frank.id)]

    # Result that matches a trigram twice ranks better than result that matches once
    response = client.get("/api/v1.0/contacts/?q=ole")

    assert response.status_code == 200
    contact_ids = [contact["id"] for contact in response.json()]
    # "Nicole Foole" matches twice on "ole"
    assert contact_ids == [str(nicole.id), str(frank.id)]

    response = client.get("/api/v1.0/contacts/?q=ool")

    assert response.status_code == 200
    contact_ids = [contact["id"] for contact in response.json()]
    assert contact_ids == [str(nicole.id), str(frank.id)]


def test_api_contacts_list_authenticated_uppercase_content():
    """Upper case content should be found by lower case query."""
    identity = factories.IdentityFactory()
    user = identity.user

    dave = factories.ContactFactory(
        full_name="EEE", short_name="AAA", owner=user
    )

    # Unaccented full name
    client = APIClient()
    client.force_login(user)

    response = client.get("/api/v1.0/contacts/?q=eee")

    assert response.status_code == 200
    contact_ids = [contact["id"] for contact in response.json()]
    assert contact_ids == [str(dave.id)]

    # Unaccented short name
    response = client.get("/api/v1.0/contacts/?q=aaa")

    assert response.status_code == 200
    contact_ids = [contact["id"] for contact in response.json()]
    assert contact_ids == [str(dave.id)]


def test_api_contacts_list_authenticated_capital_query():
    """Upper case query should find lower case content."""
    identity = factories.IdentityFactory()
    user = identity.user

    dave = factories.ContactFactory(full_name="eee", short_name="aaa", owner=user)

    client = APIClient()
    client.force_login(user)

    # Unaccented full name
    response = client.get("/api/v1.0/contacts/?q=EEE")

    assert response.status_code == 200
    contact_ids = [contact["id"] for contact in response.json()]
    assert contact_ids == [str(dave.id)]

    # Unaccented short name
    response = client.get("/api/v1.0/contacts/?q=AAA")

    assert response.status_code == 200
    contact_ids = [contact["id"] for contact in response.json()]
    assert contact_ids == [str(dave.id)]


def test_api_contacts_list_authenticated_accented_content():
    """Accented content should be found by unaccented query."""
    identity = factories.IdentityFactory()
    user = identity.user

    dave = factories.ContactFactory(full_name="ééé", short_name="ààà", owner=user)

    client = APIClient()
    client.force_login(user)

    # Unaccented full name
    response = client.get("/api/v1.0/contacts/?q=eee")

    assert response.status_code == 200
    contact_ids = [contact["id"] for contact in response.json()]
    assert contact_ids == [str(dave.id)]

    # Unaccented short name
    response = client.get("/api/v1.0/contacts/?q=aaa")

    assert response.status_code == 200
    contact_ids = [contact["id"] for contact in response.json()]
    assert contact_ids == [str(dave.id)]


def test_api_contacts_list_authenticated_accented_query():
    """Accented query should find unaccented content."""
    identity = factories.IdentityFactory()
    user = identity.user

    dave = factories.ContactFactory(full_name="eee", short_name="aaa", owner=user)

    client = APIClient()
    client.force_login(user)

    # Unaccented full name
    response = client.get("/api/v1.0/contacts/?q=ééé")

    assert response.status_code == 200
    contact_ids = [contact["id"] for contact in response.json()]
    assert contact_ids == [str(dave.id)]

    # Unaccented short name
    response = client.get("/api/v1.0/contacts/?q=ààà")

    assert response.status_code == 200
    contact_ids = [contact["id"] for contact in response.json()]
    assert contact_ids == [str(dave.id)]


def test_api_contacts_retrieve_anonymous():
    """Anonymous users should not be allowed to retrieve a user."""
    client = APIClient()
    contact = factories.ContactFactory()
    response = client.get(f"/api/v1.0/contacts/{contact.id!s}/")

    assert response.status_code == 401
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }


def test_api_contacts_retrieve_authenticated_owned():
    """
    Authenticated users should be allowed to retrieve a contact they own.
    """
    identity = factories.IdentityFactory()
    user = identity.user

    base_users = factories.UserFactory.create_batch(2)

    contact = factories.ContactFactory(bases=base_users, owner=user)

    client = APIClient()
    client.force_login(user)

    response = client.get(f"/api/v1.0/contacts/{contact.id!s}/")

    assert response.status_code == 200
    assert response.json() == {
        "id": str(contact.id),
        "bases": [str(u.id) for u in base_users],
        "owner": str(contact.owner.id),
        "data": contact.data,
        "full_name": contact.full_name,
        "short_name": contact.short_name,
    }


def test_api_contacts_retrieve_authenticated_other():
    """
    Authenticated users should not be allowed to retrieve another user's contacts.
    """
    identity = factories.IdentityFactory()
    contact = factories.ContactFactory()

    client = APIClient()
    client.force_login(identity.user)

    response = client.get(f"/api/v1.0/contacts/{contact.id!s}/")
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to perform this action."
    }


def test_api_contacts_create_anonymous_forbidden():
    """Anonymous users should not be able to create contacts via the API."""
    response = APIClient().post(
        "/api/v1.0/contacts/",
        {
            "full_name": "David",
            "short_name": "Bowman",
        },
    )
    assert response.status_code == 401
    assert not models.Contact.objects.exists()


def test_api_contacts_create_authenticated_successful():
    """Authenticated users should be able to create contacts."""
    identity = factories.IdentityFactory()
    user = identity.user
    base_users = factories.UserFactory.create_batch(5)

    client = APIClient()
    client.force_login(user)

    # Existing override for another user should not interfere
    factories.ContactFactory(bases=base_users)

    response = client.post(
        "/api/v1.0/contacts/",
        {
            "bases": [str(u.id) for u in base_users],
            "full_name": "David Bowman",
            "short_name": "Dave",
            "data": CONTACT_DATA,
        },
        format="json",
    )

    assert response.status_code == 201
    assert models.Contact.objects.count() == 2

    contact = models.Contact.objects.get(owner=user)
    assert response.json() == {
        "id": str(contact.id),
        "bases": [str(u.id) for u in base_users],
        "data": CONTACT_DATA,
        "full_name": "David Bowman",
        "owner": str(user.id),
        "short_name": "Dave",
    }

    assert contact.full_name == "David Bowman"
    assert contact.short_name == "Dave"
    assert contact.data == CONTACT_DATA
    assert list(contact.bases.all()) == base_users
    assert contact.owner == user


def test_api_contacts_create_authenticated_without_bases():
    """Authenticated users should be able to create contact without bases."""
    identity = factories.IdentityFactory()
    user = identity.user

    client = APIClient()
    client.force_login(user)

    response = client.post(
        "/api/v1.0/contacts/",
        {
            "full_name": "David Bowman",
            "short_name": "Dave",
            "data": CONTACT_DATA,
        },
        format="json",
    )

    assert response.status_code == 201

    contact = models.Contact.objects.get(owner=user)
    assert response.json() == {
        "id": str(contact.id),
        "bases": [],
        "data": CONTACT_DATA,
        "full_name": "David Bowman",
        "owner": str(user.id),
        "short_name": "Dave",
    }

@override_settings(ALLOW_API_USER_CREATE=True)
def test_api_contacts_create_authenticated_existing_override():
    """
    Trying to create a contact for base contact that is already overridden by the user
    should receive a 400 error.
    """
    identity = factories.IdentityFactory()
    user = identity.user

    base_users = factories.UserFactory.create_batch(5)
    factories.ContactFactory(bases=base_users, owner=user)

    client = APIClient()
    client.force_login(user)

    response = client.post(
        "/api/v1.0/contacts/",
        {
            "bases": [str(u.id) for u in base_users],
            "full_name": "David Bowman",
            "short_name": "Dave",
            "data": CONTACT_DATA,
        },
        format="json",
    )

    assert response.status_code == 400
    assert models.Contact.objects.count() == 1

    assert response.json() == {
        "bases": ["Contacts with this Owner and Bases already exist."]
    }


def test_api_contacts_create_authenticated_bases_include_owner():
    """
    Wip.
    """
    identity = factories.IdentityFactory()
    user = identity.user

    client = APIClient()
    client.force_login(user)

    response = client.post(
        "/api/v1.0/contacts/",
        {
            "bases": [str(user.id)],
            "full_name": "David Bowman",
            "short_name": "Dave",
            "data": CONTACT_DATA,
        },
        format="json",
    )

    assert response.status_code == 400
    assert models.Contact.objects.count() == 0

    assert response.json() == {
        "bases": ["A contact should not point to its owner."]
    }


def test_api_contacts_update_anonymous():
    """Anonymous users should not be allowed to update a contact."""
    contact = factories.ContactFactory()
    old_contact_values = serializers.ContactSerializer(instance=contact).data

    new_contact_values = serializers.ContactSerializer(
        instance=factories.ContactFactory()
    ).data
    new_contact_values["base"] = str(factories.ContactFactory().id)
    response = APIClient().put(
        f"/api/v1.0/contacts/{contact.id!s}/",
        new_contact_values,
        format="json",
    )
    assert response.status_code == 401
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }

    contact.refresh_from_db()
    contact_values = serializers.ContactSerializer(instance=contact).data
    assert contact_values == old_contact_values


def test_api_contacts_update_authenticated_owned():
    """
    Authenticated users should be allowed to update their own contacts.
    """
    identity = factories.IdentityFactory()
    user = identity.user

    client = APIClient()
    client.force_login(user)

    contact = factories.ContactFactory(owner=user)  # Owned by the logged-in user
    old_contact_values = serializers.ContactSerializer(instance=contact).data

    new_contact_values = serializers.ContactSerializer(
        instance=factories.ContactFactory()
    ).data

    # "bases" field is read-only on update
    new_contact_values["bases"] = [str(factories.UserFactory().id)]

    response = client.put(
        f"/api/v1.0/contacts/{contact.id!s}/",
        new_contact_values,
        format="json",
    )

    assert response.status_code == 200

    contact.refresh_from_db()
    contact_values = serializers.ContactSerializer(instance=contact).data
    for key, value in contact_values.items():
        if key in ["bases", "owner", "id"]:
            assert value == old_contact_values[key]
        else:
            assert value == new_contact_values[key]


def test_api_contacts_update_authenticated_other():
    """
    Authenticated users should not be allowed to update contacts owned by other users.
    """
    identity = factories.IdentityFactory()
    user = identity.user

    client = APIClient()
    client.force_login(user)

    contact = factories.ContactFactory()  # owned by another user
    old_contact_values = serializers.ContactSerializer(instance=contact).data

    new_contact_values = serializers.ContactSerializer(
        instance=factories.ContactFactory()
    ).data
    new_contact_values["bases"] = [str(factories.UserFactory().id)]

    response = client.put(
        f"/api/v1.0/contacts/{contact.id!s}/",
        new_contact_values,
        format="json",
    )

    assert response.status_code == 403

    contact.refresh_from_db()
    contact_values = serializers.ContactSerializer(instance=contact).data
    assert contact_values == old_contact_values


def test_api_contacts_delete_list_anonymous():
    """Anonymous users should not be allowed to delete a list of contacts."""
    factories.ContactFactory.create_batch(2)

    response = APIClient().delete("/api/v1.0/contacts/")

    assert response.status_code == 401
    assert models.Contact.objects.count() == 2


def test_api_contacts_delete_list_authenticated():
    """Authenticated users should not be allowed to delete a list of contacts."""
    identity = factories.IdentityFactory()
    user = identity.user

    client = APIClient()
    client.force_login(user)

    factories.ContactFactory.create_batch(2)

    response = client.delete("/api/v1.0/contacts/")

    assert response.status_code == 405
    assert models.Contact.objects.count() == 2


def test_api_contacts_delete_anonymous():
    """Anonymous users should not be allowed to delete a contact."""
    contact = factories.ContactFactory()

    client = APIClient()
    response = client.delete(f"/api/v1.0/contacts/{contact.id!s}/")

    assert response.status_code == 401
    assert models.Contact.objects.count() == 1


def test_api_contacts_delete_authenticated_owner():
    """
    Authenticated users should be allowed to delete a contact they own.
    """
    identity = factories.IdentityFactory()
    user = identity.user
    contact = factories.ContactFactory(owner=user)

    client = APIClient()
    client.force_login(user)

    response = client.delete(
        f"/api/v1.0/contacts/{contact.id!s}/",
    )

    assert response.status_code == 204
    assert not models.Contact.objects.exists()



def test_api_contacts_delete_authenticated_other():
    """
    Authenticated users should not be allowed to delete a contact they don't own.
    """
    identity = factories.IdentityFactory()
    user = identity.user
    contact = factories.ContactFactory()

    client = APIClient()
    client.force_login(user)

    response = client.delete(
        f"/api/v1.0/contacts/{contact.id!s}/",
    )

    assert response.status_code == 403
    assert models.Contact.objects.count() == 1
