"""Filters for viewsets."""

from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Func, Max, Value
from django.db.models.functions import Coalesce

SIMILARITY_THRESHOLD = 0.04


def get_user_queryset(queryset, search_field, query):
    """
    Filters user queryset by case-insensitive and accent-insensitive trigram similarity
    """

    similarity = Max(
        TrigramSimilarity(
            Coalesce(Func(f"{search_field}__email", function="unaccent"), Value("")),
            Func(Value(query), function="unaccent"),
        )
        + TrigramSimilarity(
            Coalesce(Func(f"{search_field}__name", function="unaccent"), Value("")),
            Func(Value(query), function="unaccent"),
        )
    )
    queryset = (
        queryset.annotate(similarity=similarity)
        .filter(similarity__gte=SIMILARITY_THRESHOLD)
        .order_by("-similarity")
    )
    return queryset
