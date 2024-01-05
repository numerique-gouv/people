"""
Test suite for generated openapi schema.
"""
import json
from io import StringIO

from django.core.management import call_command
from django.test import Client

import pytest

pytestmark = pytest.mark.django_db


def test_openapi_client_schema():
    """
    Generated OpenAPI client schema should be correct.
    """
    response = Client().get("/v1.0/swagger.json")

    assert response.status_code == 200
    with open("core/tests/swagger/swagger.json") as expected_schema:
        assert response.json() == json.load(expected_schema)
