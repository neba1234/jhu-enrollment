from django.urls import path
from . import views

urlpatterns = [
    path('enrollments', views.enrollments, name='enrollments'),
    path('cities', views.cities, name='cities'),
    path('leaders', views.leaders, name='leaders'),
]
