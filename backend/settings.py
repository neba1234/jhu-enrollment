"""
Django settings for JHU Enrollment backend.
Serves Airtable proxy API endpoints.
"""

import os
from pathlib import Path

# Try to load .env file for local development
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / '.env')
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'dev-secret-key-change-in-production')

DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() in ('true', '1', 'yes')

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'corsheaders',
    'airtable_api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'backend.urls'

# CORS — allow the Vite dev server and any production frontend
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000'
    ).split(',')
]
CORS_ALLOW_ALL_ORIGINS = DEBUG  # wide-open in dev, explicit in prod

# Airtable credentials (loaded from environment / .env)
AIRTABLE_BASE_ID = os.environ.get('AIRTABLE_BASE_ID', '')
AIRTABLE_PAT = os.environ.get('AIRTABLE_PAT', '')

# Minimal settings — no database, no templates needed for a pure API
DATABASES = {}
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Static files (serve the built React dashboard)
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'dashboard' / 'dist',
]
