"""
URL configuration for backend project.
"""

from django.contrib import admin
from django.urls import path, include, re_path

from drf_yasg.views import get_schema_view
from rest_framework import permissions
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="ClassConnect API",
        default_version="v1",
        description="API for ClassConnect",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="ivan.tomdieu@gmail.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

admin.site.site_header = "Classconnect Backend"
admin.site.site_title = "Classconnect Backend"
admin.site.index_title = "Classconnect Administration"
admin.empty_value_display = "**Empty**"

urlpatterns = [
    path("admin/", admin.site.urls),
    path(
        "api/",
        include(
            [
                path("", include("users.urls")),
                path("", include("courses.urls")),
                path("", include("payments.urls")),
                path("", include("notifications.urls")),
                path("", include("streamings.urls")),
                path("", include("forum.urls")),
                path("", include("site_settings.urls")),
                
                # Updated OAuth2 configuration with explicit namespace and application name
                re_path(
                    r"^auth/",
                    include(
                        ("drf_social_oauth2.urls", "drf_social_oauth2"), namespace="drf"
                    ),
                ),
                path(
                    "docs/",
                    schema_view.with_ui("swagger", cache_timeout=0),
                    name="schema-swagger-ui",
                ),
            ]
        ),
    ),
    path(
        "swagger<format>/", schema_view.without_ui(cache_timeout=0), name="schema-json"
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
]
