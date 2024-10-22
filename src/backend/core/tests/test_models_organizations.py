"""
Unit tests for the Organization model
"""

import copy
from importlib import reload

from django.apps import apps
from django.core.exceptions import ValidationError

import pytest

from core import factories, models

pytestmark = pytest.mark.django_db


def test_models_organization_str():
    """The str representation should be the organization's name."""
    organization = factories.OrganizationFactory(
        name="HAL 9000", registration_id_list=["12345678901234"]
    )
    assert str(organization) == f"HAL 9000 (# {organization.pk})"


def test_models_organization_constraints():
    """It should not be possible to create an organization."""
    organization = factories.OrganizationFactory(
        registration_id_list=["12345678901234"], domain_list=["hal9000.com"]
    )

    with pytest.raises(ValidationError):
        models.Organization.objects.create(name="HAL 9000")

    with pytest.raises(ValidationError):
        models.Organization.objects.create(
            name="HAL 9000",
            registration_id_list=[
                organization.registration_id_list[0],
                "12345678901235",
            ],
        )

    with pytest.raises(ValidationError):
        models.Organization.objects.create(
            name="HAL 9000", domain_list=[organization.domain_list[0], "hal9001.com"]
        )


def test_models_organization_get_or_create_no_kwargs():
    """It should fail."""
    with pytest.raises(ValueError):
        models.Organization.objects.get_or_create()


def test_models_organization_get_or_create_with_siret():
    """It should create an organization with a SIRET number."""
    organization, created = models.Organization.objects.get_or_create(
        registration_id="12345678901234"
    )
    assert created is True
    assert organization.registration_id_list == ["12345678901234"]
    assert organization.domain_list == []

    same_organization, created = models.Organization.objects.get_or_create(
        registration_id="12345678901234"
    )
    assert created is False
    assert organization == same_organization
    assert same_organization.registration_id_list == ["12345678901234"]
    assert same_organization.domain_list == []


def test_models_organization_get_or_create_with_domain():
    """It should create an organization with a domain."""
    organization, created = models.Organization.objects.get_or_create(
        domain="hal9000.com"
    )
    assert created is True
    assert organization.registration_id_list == []
    assert organization.domain_list == ["hal9000.com"]

    same_organization, created = models.Organization.objects.get_or_create(
        domain="hal9000.com"
    )
    assert created is False
    assert organization == same_organization
    assert same_organization.registration_id_list == []
    assert same_organization.domain_list == ["hal9000.com"]


def test_models_organization_get_or_create_with_siret_and_domain():
    """It should create an organization with a SIRET number."""
    organization, created = models.Organization.objects.get_or_create(
        registration_id="12345678901234", domain="hal9000.com"
    )
    assert created is True
    assert organization.registration_id_list == ["12345678901234"]
    assert organization.domain_list == []

    same_organization, created = models.Organization.objects.get_or_create(
        registration_id="12345678901234", domain="hal9000.com"
    )
    assert created is False
    assert organization == same_organization
    assert same_organization.registration_id_list == ["12345678901234"]
    assert same_organization.domain_list == []


def test_models_organization_registration_id_validators(settings):
    """Test the registration ID validators."""
    __initial_validators = copy.deepcopy(
        settings.ORGANIZATION_REGISTRATION_ID_VALIDATORS
    )

    models.Organization.objects.create(name="hey", registration_id_list=["abc"])  # ok

    settings.ORGANIZATION_REGISTRATION_ID_VALIDATORS = [
        {
            "NAME": "django.core.validators.RegexValidator",
            "OPTIONS": {
                "regex": "[0-9]{14}",
            },
        },
    ]

    # Reload the models module to apply the new validator settings
    apps.all_models["core"].clear()
    reload(models)

    models.Organization.objects.create(
        name="ho",
        registration_id_list=["12345678901234"],
    )
    with pytest.raises(ValidationError):
        models.Organization.objects.create(
            name="ha",
            registration_id_list=["1234567890123a"],
        )

    settings.ORGANIZATION_REGISTRATION_ID_VALIDATORS = [
        {
            "NAME": "django.core.validators.RegexValidator",
            "OPTIONS": {
                "regex": "[a-z][0-9]{14}",
            },
        },
    ]

    # Reload the models module to apply the new validator settings
    apps.all_models["core"].clear()
    reload(models)

    models.Organization.objects.create(
        name="hu",
        registration_id_list=["a12345678901234"],
    )
    with pytest.raises(ValidationError):
        models.Organization.objects.create(
            name="hi",
            registration_id_list=["12345678912345"],
        )

    # Reset the settings
    settings.ORGANIZATION_REGISTRATION_ID_VALIDATORS = __initial_validators
    apps.all_models["core"].clear()
    reload(models)
