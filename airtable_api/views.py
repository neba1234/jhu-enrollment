"""
Django views that proxy Airtable API requests.

Endpoints:
  /api/enrollments
  /api/cities
  /api/leaders

Credentials are kept server-side via environment variables.
"""

import json
import urllib.request
import urllib.parse
import urllib.error

from django.conf import settings
from django.http import JsonResponse


def _fetch_airtable_table(table_name):
    """
    Generic helper that fetches all records from an Airtable table,
    handling pagination automatically.

    Returns a list of Airtable record dicts.
    """
    base_id = settings.AIRTABLE_BASE_ID
    pat = settings.AIRTABLE_PAT

    if not base_id or not pat:
        return None, 'Airtable credentials not configured'

    headers = {
        'Authorization': f'Bearer {pat}',
        'Content-Type': 'application/json',
    }

    all_records = []
    offset = None

    while True:
        url = f'https://api.airtable.com/v0/{base_id}/{urllib.parse.quote(table_name)}'
        if offset:
            url += f'?offset={offset}'

        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            return None, f'Airtable API error: {e.code} {e.reason}'

        all_records.extend(data.get('records', []))
        offset = data.get('offset')
        if not offset:
            break

    return all_records, None


def _airtable_view(request, table_name):
    """Shared handler for all three endpoints."""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    records, error = _fetch_airtable_table(table_name)
    if error:
        return JsonResponse({'error': error}, status=500)

    return JsonResponse({'records': records})


# ── Public views ──────────────────────────────────────────────

def enrollments(request):
    """GET /api/enrollments — proxy to Airtable Enrollments table."""
    return _airtable_view(request, 'Enrollments')


def cities(request):
    """GET /api/cities — proxy to Airtable Cities table."""
    return _airtable_view(request, 'Cities')


def leaders(request):
    """GET /api/leaders — proxy to Airtable Leaders table."""
    return _airtable_view(request, 'Leaders')
