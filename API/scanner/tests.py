from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from .utils import ScanError, _should_skip_href
from .views import _normalize_url


class SkipHrefTests(TestCase):
    def test_empty_and_hash(self):
        self.assertTrue(_should_skip_href(""))
        self.assertTrue(_should_skip_href("#"))
        self.assertTrue(_should_skip_href("  "))

    def test_skipped_schemes(self):
        self.assertTrue(_should_skip_href("mailto:a@b.com"))
        self.assertTrue(_should_skip_href("javascript:void(0)"))
        self.assertTrue(_should_skip_href("tel:+1234"))
        self.assertTrue(_should_skip_href("data:image/png;base64,abc"))

    def test_skipped_extensions(self):
        self.assertTrue(_should_skip_href("https://example.com/image.png"))
        self.assertTrue(_should_skip_href("https://example.com/style.css"))
        self.assertTrue(_should_skip_href("https://example.com/app.js"))
        self.assertTrue(_should_skip_href("https://example.com/file.pdf?v=2"))

    def test_valid_links_not_skipped(self):
        self.assertFalse(_should_skip_href("https://example.com/page"))
        self.assertFalse(_should_skip_href("https://example.com/?ref=abc"))
        self.assertFalse(_should_skip_href("/relative/path"))


class NormalizeUrlTests(TestCase):
    def test_bare_hostname(self):
        url, err = _normalize_url("example.com")
        self.assertIsNone(err)
        self.assertEqual(url, "https://example.com")

    def test_with_https(self):
        url, err = _normalize_url("https://example.com")
        self.assertIsNone(err)
        self.assertEqual(url, "https://example.com")

    def test_with_http(self):
        url, err = _normalize_url("http://example.com")
        self.assertIsNone(err)
        self.assertEqual(url, "http://example.com")

    def test_invalid_scheme(self):
        url, err = _normalize_url("ftp://example.com")
        self.assertIsNone(url)
        self.assertIn("Invalid scheme", err)

    def test_empty_netloc(self):
        url, err = _normalize_url("")
        self.assertIsNone(url)
        self.assertIn("no hostname", err)

    def test_whitespace_stripped(self):
        url, err = _normalize_url("  example.com  ")
        self.assertIsNone(err)
        self.assertEqual(url, "https://example.com")


class AnalyzeUrlViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/analyze/"

    def test_missing_url_returns_400(self):
        resp = self.client.post(self.url, {}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("error", resp.data)

    def test_invalid_scheme_returns_400(self):
        resp = self.client.post(self.url, {"url": "ftp://evil.com"}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Invalid scheme", resp.data["error"])

    @patch("scanner.views.scan_website")
    def test_successful_scan(self, mock_scan):
        mock_scan.return_value = {
            "title": "Test Page",
            "url": "https://example.com",
            "total_links": 5,
            "suspicious_count": 0,
            "detected_keywords": [],
            "risk_score": 0,
            "is_sponsored": False,
        }
        resp = self.client.post(self.url, {"url": "example.com"}, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["title"], "Test Page")
        self.assertEqual(resp.data["total_links"], 5)
        self.assertFalse(resp.data["is_sponsored"])

    @patch("scanner.views.scan_website")
    def test_timeout_returns_504(self, mock_scan):
        mock_scan.side_effect = ScanError("timeout", "The page took too long to load.", "TimeoutException")
        resp = self.client.post(self.url, {"url": "example.com"}, format="json")
        self.assertEqual(resp.status_code, 504)
        self.assertEqual(resp.data["error_code"], "timeout")

    @patch("scanner.views.scan_website")
    def test_browser_error_returns_502(self, mock_scan):
        mock_scan.side_effect = ScanError("browser_error", "Could not start the browser.", "SessionNotCreated")
        resp = self.client.post(self.url, {"url": "example.com"}, format="json")
        self.assertEqual(resp.status_code, 502)
        self.assertEqual(resp.data["error_code"], "browser_error")

    @patch("scanner.views.scan_website")
    def test_unexpected_error_returns_500(self, mock_scan):
        mock_scan.side_effect = RuntimeError("unexpected")
        resp = self.client.post(self.url, {"url": "example.com"}, format="json")
        self.assertEqual(resp.status_code, 500)
        self.assertEqual(resp.data["error_code"], "internal_error")

    @patch("scanner.views.scan_website")
    def test_include_timing_flag(self, mock_scan):
        mock_scan.return_value = {
            "title": "Test",
            "url": "https://example.com",
            "total_links": 0,
            "suspicious_count": 0,
            "detected_keywords": [],
            "risk_score": 0,
            "is_sponsored": False,
            "timing": {"total": 1.5},
        }
        resp = self.client.post(
            self.url,
            {"url": "example.com", "include_timing": True},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        mock_scan.assert_called_once()
        _, kwargs = mock_scan.call_args
        self.assertTrue(kwargs.get("include_timing"))
