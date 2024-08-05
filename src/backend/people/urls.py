"""People URL Configuration"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import path, re_path

from drf_spectacular.views import (
    SpectacularJSONAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from debug import urls as debug_urls

from . import api_urls

API_VERSION = settings.API_VERSION

urlpatterns = [
    path("admin/", admin.site.urls),
] + api_urls.urlpatterns

if settings.DEBUG:
    urlpatterns = (
        urlpatterns
        + staticfiles_urlpatterns()
        + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
        + debug_urls.urlpatterns
    )

if settings.USE_SWAGGER or settings.DEBUG:
    urlpatterns += [
        path(
            f"api/{API_VERSION}/swagger.json",
            SpectacularJSONAPIView.as_view(
                api_version=API_VERSION,
                urlconf="people.api_urls",
            ),
            name="client-api-schema",
        ),
        path(
            f"api/{API_VERSION}/swagger/",
            SpectacularSwaggerView.as_view(url_name="client-api-schema"),
            name="swagger-ui-schema",
        ),
        re_path(
            f"api/{API_VERSION}/redoc/",
            SpectacularRedocView.as_view(url_name="client-api-schema"),
            name="redoc-schema",
        ),
    ]
