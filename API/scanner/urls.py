from django.urls import path

from . import views

urlpatterns = [
    # React'in istek atacağı adres: http://127.0.0.1:8000/api/analyze/
    path('api/analyze/', views.analyze_url, name='analyze_url'),
]
