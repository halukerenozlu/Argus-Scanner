from urllib.parse import urlparse

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .utils import scan_website


def _normalize_url(raw):
    """
    Normalizes and validates a URL string.
    Returns (normalized_url, error_message).
    error_message is None when the URL is valid.

    Logic:
      1. Parse the raw input to detect whether a scheme is already present.
      2. If a scheme IS present and it is not http/https → reject immediately
         (never prepend, never reach Selenium).
      3. If NO scheme is present → prepend https:// and re-parse.
      4. Reject if the resulting netloc is empty.
    """
    url = raw.strip()
    parsed = urlparse(url)

    if parsed.scheme:
        # Scheme already present — reject anything that isn't http/https
        if parsed.scheme not in ("http", "https"):
            return None, (
                f"Invalid scheme '{parsed.scheme}'. Only http and https are accepted."
            )
    else:
        # No scheme — treat as a bare hostname/path and prepend https://
        url = "https://" + url
        parsed = urlparse(url)

    if not parsed.netloc:
        return None, "Invalid URL: no hostname found."

    return url, None


@api_view(['POST'])
def analyze_url(request):
    raw_url = request.data.get('url')
    if not raw_url:
        return Response({"error": "URL gerekli"}, status=400)

    url, error = _normalize_url(raw_url)
    if error:
        return Response({"error": error}, status=400)

    # Selenium motorunu çalıştır
    result = scan_website(url)

    return Response(result)
