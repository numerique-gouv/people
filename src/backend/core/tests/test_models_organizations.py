"""
Unit tests for the Organization model
"""

from django.core.exceptions import ValidationError

import pytest

from core import factories, models

pytestmark = pytest.mark.django_db


def test_models_organization_str():
    """The str representation should be the organization's name."""
    organization = factories.OrganizationFactory(
        name="HAL 9000", sirets=["12345678901234"]
    )
    assert str(organization) == f"HAL 9000 (# {organization.pk})"


def test_models_organization_constraints():
    """It should not be possible to create an organization."""
    organization = factories.OrganizationFactory(
        sirets=["12345678901234"], domains=["hal9000.com"]
    )

    with pytest.raises(ValidationError):
        models.Organization.objects.create(name="HAL 9000")

    with pytest.raises(ValidationError):
        models.Organization.objects.create(
            name="HAL 9000", sirets=[organization.sirets[0], "12345678901235"]
        )

    with pytest.raises(ValidationError):
        models.Organization.objects.create(
            name="HAL 9000", domains=[organization.domains[0], "hal9001.com"]
        )


def test_models_organization_get_or_create_no_kwargs():
    """It should fail."""
    with pytest.raises(ValueError):
        models.Organization.objects.get_or_create()


def test_models_organization_get_or_create_with_siret():
    """It should create an organization with a SIRET number."""
    organization, created = models.Organization.objects.get_or_create(
        siret="12345678901234"
    )
    assert created is True
    assert organization.sirets == ["12345678901234"]
    assert organization.domains == []

    same_organization, created = models.Organization.objects.get_or_create(
        siret="12345678901234"
    )
    assert created is False
    assert organization == same_organization
    assert same_organization.sirets == ["12345678901234"]
    assert same_organization.domains == []


def test_models_organization_get_or_create_with_domain():
    """It should create an organization with a domain."""
    organization, created = models.Organization.objects.get_or_create(
        domain="hal9000.com"
    )
    assert created is True
    assert organization.sirets == []
    assert organization.domains == ["hal9000.com"]

    same_organization, created = models.Organization.objects.get_or_create(
        domain="hal9000.com"
    )
    assert created is False
    assert organization == same_organization
    assert same_organization.sirets == []
    assert same_organization.domains == ["hal9000.com"]


def test_models_organization_get_or_create_with_siret_and_domain():
    """It should create an organization with a SIRET number."""
    organization, created = models.Organization.objects.get_or_create(
        siret="12345678901234", domain="hal9000.com"
    )
    assert created is True
    assert organization.sirets == ["12345678901234"]
    assert organization.domains == []

    same_organization, created = models.Organization.objects.get_or_create(
        siret="12345678901234", domain="hal9000.com"
    )
    assert created is False
    assert organization == same_organization
    assert same_organization.sirets == ["12345678901234"]
    assert same_organization.domains == []
