"""
Root URL configuration — routes /api/* to the airtable_api app.
"""

from django.urls import path, include

urlpatterns = [
    path('api/', include('airtable_api.urls')),
]
