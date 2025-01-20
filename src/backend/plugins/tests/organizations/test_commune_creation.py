"""Tests for the CommuneCreation plugin."""

from django.conf import settings

import pytest
import responses

from core.models import Organization
from core.plugins.loader import get_organization_plugins

from plugins.organizations import ApiCall, CommuneCreation

pytestmark = pytest.mark.django_db


# disable unused-argument for because organization_plugins_settings
# is used to set the settings not to be used in the test
# pylint: disable=unused-argument


@pytest.fixture(name="organization_plugins_settings")
def organization_plugins_settings_fixture(op_settings):
    """
    Fixture to set the organization plugins settings and
    leave the initial state after the test.
    """
    _original_plugins = op_settings.ORGANIZATION_PLUGINS

    op_settings.ORGANIZATION_PLUGINS = ["plugins.organizations.CommuneCreation"]

    # reset get_organization_plugins cache
    get_organization_plugins.cache_clear()
    get_organization_plugins()  # call to populate the cache

    yield

    # reset get_organization_plugins cache
    op_settings.ORGANIZATION_PLUGINS = _original_plugins
    get_organization_plugins.cache_clear()
    get_organization_plugins()  # call to populate the cache


@responses.activate
def test_organization_plugins_run_after_create(organization_plugins_settings):
    """Test the run_after_create method of the organization plugins for nominal case."""
    responses.add(
        responses.GET,
        "https://recherche-entreprises.api.gouv.fr/search?q=12345678901234",
        json={
            "results": [
                {
                    # skipping some fields
                    "matching_etablissements": [
                        # skipping some fields
                        {
                            "liste_enseignes": ["AMAZING ORGANIZATION"],
                            "siret": "12345678901234",
                        }
                    ]
                }
            ],
            "total_results": 1,
            "page": 1,
            "per_page": 10,
            "total_pages": 1,
        },
        status=200,
    )

    organization = Organization.objects.create(
        name="12345678901234", registration_id_list=["12345678901234"]
    )
    assert organization.name == "Amazing Organization"

    # Check that the organization has been updated in the database also
    organization.refresh_from_db()
    assert organization.name == "Amazing Organization"


@responses.activate
def test_organization_plugins_run_after_create_api_fail(organization_plugins_settings):
    """Test the plugin when the API call fails."""
    responses.add(
        responses.GET,
        "https://recherche-entreprises.api.gouv.fr/search?q=12345678901234",
        json={"error": "Internal Server Error"},
        status=500,
    )

    organization = Organization.objects.create(
        name="12345678901234", registration_id_list=["12345678901234"]
    )
    assert organization.name == "12345678901234"


@responses.activate
@pytest.mark.parametrize(
    "results",
    [
        {"results": []},
        {"results": [{"matching_etablissements": []}]},
        {"results": [{"matching_etablissements": [{"siret": "12345678901234"}]}]},
        {
            "results": [
                {
                    "matching_etablissements": [
                        {"siret": "12345678901234", "liste_enseignes": []}
                    ]
                }
            ]
        },
    ],
)
def test_organization_plugins_run_after_create_missing_data(
    organization_plugins_settings, results
):
    """Test the plugin when the API call returns missing data."""
    responses.add(
        responses.GET,
        "https://recherche-entreprises.api.gouv.fr/search?q=12345678901234",
        json=results,
        status=200,
    )

    organization = Organization.objects.create(
        name="12345678901234", registration_id_list=["12345678901234"]
    )
    assert organization.name == "12345678901234"


@responses.activate
def test_organization_plugins_run_after_create_name_already_set(
    organization_plugins_settings,
):
    """Test the plugin does nothing when the name already differs from the registration ID."""
    organization = Organization.objects.create(
        name="Magic WOW", registration_id_list=["12345678901234"]
    )
    assert organization.name == "Magic WOW"


def test_extract_name_from_org_data_when_commune(
    organization_plugins_settings,
):
    """Test the name is extracted correctly for a French commune."""
    data = {
        "results": [
            {
                "nom_complet": "COMMUNE DE VARZY",
                "nom_raison_sociale": "COMMUNE DE VARZY",
                "siege": {
                    "libelle_commune": "VARZY",
                    "liste_enseignes": ["MAIRIE"],
                    "siret": "21580304000017",
                },
                "nature_juridique": "7210",
                "matching_etablissements": [
                    {
                        "siret": "21580304000017",
                        "libelle_commune": "VARZY",
                        "liste_enseignes": ["MAIRIE"],
                    }
                ],
            }
        ]
    }

    plugin = CommuneCreation()
    name = plugin.get_organization_name_from_results(data, "21580304000017")
    assert name == "Varzy"


def test_api_call_execution():
    """Test that calling execute() faithfully executes the API call"""
    task = ApiCall()
    task.method = "POST"
    task.base = "https://some_host"
    task.url = "some_url"
    task.params = {"some_key": "some_value"}
    task.headers = {"Some-Header": "Some-Header-Value"}

    with responses.RequestsMock() as rsps:
        rsps.add(
            rsps.POST,
            url="https://some_host/some_url",
            body='{"some_key": "some_value"}',
            content_type="application/json",
            headers={"Some-Header": "Some-Header-Value"},
        )

        task.execute()


def test_tasks_on_commune_creation_include_zone_creation():
    """Test the first task in commune creation: creating the DNS sub-zone"""
    plugin = CommuneCreation()
    name = "Varzy"

    tasks = plugin.complete_commune_creation(name)

    assert tasks[0].base == "https://api.scaleway.com"
    assert tasks[0].url == "/domain/v2beta1/dns-zones"
    assert tasks[0].method == "POST"
    assert tasks[0].params == {
        "project_id": settings.DNS_PROVISIONING_API_PROJECT_ID,
        "domain": "collectivite.fr",
        "subdomain": "varzy",
    }
    assert tasks[0].headers["X-Auth-Token"] == settings.DNS_PROVISIONING_API_CREDENTIALS


def test_tasks_on_commune_creation_include_dimail_domain_creation():
    """Test the second task in commune creation: creating the domain in Dimail"""
    plugin = CommuneCreation()
    name = "Merlaut"

    tasks = plugin.complete_commune_creation(name)

    assert tasks[1].base == settings.MAIL_PROVISIONING_API_URL
    assert tasks[1].url == "/domains"
    assert tasks[1].method == "POST"
    assert tasks[1].params == {
        "name": "merlaut",
        "delivery": "virtual",
        "features": ["webmail"],
        "context_name": "merlaut",
    }
    assert (
        tasks[1].headers["Authorization"]
        == f"Basic: {settings.MAIL_PROVISIONING_API_CREDENTIALS}"
    )
