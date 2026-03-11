from urllib.parse import urlparse

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .utils import ScanError, scan_website


def _as_bool(value):
    """Parse common truthy payload values into bool."""
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "on"}
    if isinstance(value, (int, float)):
        return value != 0
    return False


def _normalize_url(raw):
    """
    Normalizes and validates a URL string.
    Returns (normalized_url, error_message).
    error_message is None when the URL is valid.

    Logic:
      1. Parse the raw input to detect whether a scheme is already present.
      2. If a scheme IS present and it is not http/https, reject immediately.
      3. If NO scheme is present, prepend https:// and re-parse.
      4. Reject if the resulting netloc is empty.
    """
    url = raw.strip()
    parsed = urlparse(url)

    if parsed.scheme:
        # Scheme already present: reject anything that is not http/https.
        if parsed.scheme not in ("http", "https"):
            return None, f"Invalid scheme '{parsed.scheme}'. Only http and https are accepted."
    else:
        # No scheme: treat as a bare hostname/path and prepend https://
        url = "https://" + url
        parsed = urlparse(url)

    if not parsed.netloc:
        return None, "Invalid URL: no hostname found."

    return url, None


@api_view(["POST"])
def analyze_url(request):
    raw_url = request.data.get("url")
    include_timing = _as_bool(request.data.get("include_timing"))
    if not raw_url:
        return Response({"error": "URL gerekli"}, status=400)

    url, error = _normalize_url(raw_url)
    if error:
        return Response({"error": error}, status=400)

    # Map ScanError codes to HTTP status codes.
    # timeout         -> 504 Gateway Timeout  (upstream page too slow)
    # page_load_error -> 502 Bad Gateway      (WebDriver / navigation failure)
    # browser_error   -> 502 Bad Gateway      (WebDriver could not start)
    # scan_error      -> 500 Internal Error   (unexpected / unknown)
    status_map = {
        "timeout": 504,
        "page_load_error": 502,
        "browser_error": 502,
        "scan_error": 500,
    }

    try:
        result = scan_website(url, include_timing=include_timing)
    except ScanError as exc:
        status = status_map.get(exc.error_code, 500)
        return Response(
            {
                "error": exc.error,
                "error_code": exc.error_code,
                "details": exc.details,
            },
            status=status,
        )
    except Exception:
        return Response(
            {
                "error": "An unexpected server error occurred.",
                "error_code": "internal_error",
                "details": "",
            },
            status=500,
        )

    return Response(result)
