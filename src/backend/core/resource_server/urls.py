"""Resource Server URL Configuration"""

from django.urls import path

from .views import DataView, JWKSView

urlpatterns = [
    path("jwks", JWKSView.as_view()),
    # FIXME: temporary route
    path("data", DataView.as_view()),
]
