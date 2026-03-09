# flake8: noqa
import logging
import os
import time
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.common.exceptions import (
    TimeoutException,
    WebDriverException,
    NoSuchWindowException,
)
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

logger = logging.getLogger("argus.scanner")

# ---------------------------------------------------------------------------
# Configurable performance knobs (env vars, read once at module load)
# ---------------------------------------------------------------------------
# $env:ARGUS_PAGE_LOAD_TIMEOUT="15"   seconds before Selenium aborts navigation
# $env:ARGUS_IMPLICIT_WAIT="2"        seconds Selenium waits for missing elements
# $env:ARGUS_MAX_LINKS="150"          max <a> elements to inspect per scan
# $env:ARGUS_HEADLESS_RETRIES="1"     extra headless attempts on window crash
_PAGE_LOAD_TIMEOUT = int(os.getenv("ARGUS_PAGE_LOAD_TIMEOUT", "15"))
_IMPLICIT_WAIT = int(os.getenv("ARGUS_IMPLICIT_WAIT", "2"))
_MAX_LINKS = int(os.getenv("ARGUS_MAX_LINKS", "150"))
_HEADLESS_RETRIES = max(int(os.getenv("ARGUS_HEADLESS_RETRIES", "1")), 0)

# Schemes and prefixes that should be skipped during link analysis.
_SKIP_PREFIXES = (
    "mailto:", "tel:", "javascript:", "data:", "blob:", "ftp:",
    "file:", "sms:", "whatsapp:", "viber:",
)

# File extensions that are never affiliate/redirect targets.
_SKIP_EXTENSIONS = (
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico",
    ".css", ".js", ".woff", ".woff2", ".ttf", ".eot",
    ".pdf", ".zip", ".rar", ".7z", ".tar", ".gz",
    ".mp3", ".mp4", ".avi", ".mov", ".wmv", ".webm",
)


def _truncate_details(text: str, max_len: int = 240) -> str:
    """Return the first line of text capped at max_len chars.
    Prevents multi-line Selenium 'Stacktrace: ...' blobs reaching the client.
    """
    first_line = (text or "").split("\n")[0].strip()
    return first_line[:max_len]


class ScanError(Exception):
    def __init__(self, error_code, error, details=""):
        super().__init__(error)
        self.error_code = error_code
        self.error = error
        self.details = _truncate_details(details)


def _should_skip_href(href: str) -> bool:
    """Return True if the href is irrelevant for affiliate/redirect analysis."""
    href_l = href.lower().strip()
    if not href_l or href_l == "#":
        return True
    if href_l.startswith(_SKIP_PREFIXES):
        return True
    # Strip query/fragment before checking extension
    path = href_l.split("?")[0].split("#")[0]
    if path.endswith(_SKIP_EXTENSIONS):
        return True
    return False


def _make_driver(headless: bool):
    options = uc.ChromeOptions()

    if headless:
        options.add_argument("--headless=new")

    # Stabilite argümanları
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-sandbox")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-popup-blocking")
    # Bazı ortamlarda site isolation/headless crash azaltır
    options.add_argument("--disable-features=IsolateOrigins,site-per-process")

    try:
        # version_main must match your installed Chrome major version.
        # Override via env if Chrome auto-updated: $env:ARGUS_CHROME_MAJOR="146"
        version_main = int(os.getenv("ARGUS_CHROME_MAJOR", "145"))
        # use_subprocess=True is required for stability on Windows.
        driver = uc.Chrome(options=options, use_subprocess=True, version_main=version_main)
        driver.set_page_load_timeout(_PAGE_LOAD_TIMEOUT)
        driver.implicitly_wait(_IMPLICIT_WAIT)
        return driver
    except Exception as exc:
        raise ScanError("browser_error", "Could not start the browser.", type(
            exc).__name__) from exc


def _switch_to_alive_window(driver):
    try:
        handles = driver.window_handles
    except WebDriverException as exc:
        raise ScanError("browser_closed",
                        "Browser window was closed.", str(exc)) from exc

    if not handles:
        raise ScanError(
            "browser_closed", "Browser window was closed.", "No window handles available.")

    for handle in reversed(handles):
        try:
            driver.switch_to.window(handle)
            _ = driver.current_url
            return
        except (NoSuchWindowException, WebDriverException):
            continue

    raise ScanError("browser_closed", "Browser window was closed.",
                    "All window handles are invalid.")


def _run_scan(driver, url):
    affiliate_markers = [
        "ref=",
        "tag=",
        "aff=",
        "clickid=",
        "utm_medium=affiliate",
        "promo=",
    ]
    suspicious_keywords = [
        "işbirliği",
        "reklam",
        "sponsor",
        "hediye",
        "promo",
        "indirim kodu",
        "ortaklık",
        "affiliate",
        "ücretsiz deneme",
    ]

    timing = {}
    scan_start = time.perf_counter()

    # --- Page fetch ---
    t0 = time.perf_counter()
    driver.get(url)
    _switch_to_alive_window(driver)
    timing["page_fetch"] = round(time.perf_counter() - t0, 3)

    # --- HTML parsing (wait for body) ---
    t0 = time.perf_counter()
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "body")))
    timing["html_parse"] = round(time.perf_counter() - t0, 3)

    # --- Link extraction ---
    t0 = time.perf_counter()
    links = driver.find_elements(By.TAG_NAME, "a")
    total_links = len(links)

    # Cap the number of links we actually inspect
    links_to_check = links[:_MAX_LINKS]

    hrefs = []
    for link in links_to_check:
        href = link.get_attribute("href")
        if href:
            hrefs.append(href)
    timing["link_extraction"] = round(time.perf_counter() - t0, 3)

    # --- Link analysis (filter, check for affiliate markers) ---
    # Dedup is used only to avoid redundant marker checks. Every duplicate
    # match still increments suspicious_count so scoring stays identical to
    # the original behaviour (one list entry per occurrence, not per unique URL).
    t0 = time.perf_counter()
    checked_cache = {}          # href -> bool (is suspicious)
    suspicious_links = []
    skipped = 0

    for href in hrefs:
        if _should_skip_href(href):
            skipped += 1
            continue

        if href in checked_cache:
            # Already checked — reuse result, skip the marker scan
            if checked_cache[href]:
                suspicious_links.append(href)
            continue

        href_l = href.lower()
        is_suspicious = any(m in href_l for m in affiliate_markers)
        checked_cache[href] = is_suspicious
        if is_suspicious:
            suspicious_links.append(href)

    # --- Keyword scan ---
    page_text = driver.find_element(By.TAG_NAME, "body").text.lower()
    found_keywords = [
        word for word in suspicious_keywords if word in page_text]
    timing["link_analysis"] = round(time.perf_counter() - t0, 3)

    timing["total"] = round(time.perf_counter() - scan_start, 3)

    logger.info(
        "Scan completed: url=%s total_links=%d inspected=%d skipped=%d "
        "unique=%d suspicious=%d timing=%s",
        url, total_links, len(links_to_check), skipped,
        len(checked_cache), len(suspicious_links), timing,
    )

    link_risk = min(len(suspicious_links) * 10, 50) if total_links > 0 else 0
    keyword_risk = min(len(found_keywords) * 15, 50)
    total_risk = link_risk + keyword_risk

    return {
        "title": driver.title,
        "url": url,
        "total_links": total_links,
        "suspicious_count": len(suspicious_links),
        "detected_keywords": found_keywords,
        "risk_score": total_risk,
        "is_sponsored": total_risk > 25,
    }


def _attempt(url: str, headless: bool) -> dict:
    """One full scan attempt. Owns its driver lifecycle and always raises
    ScanError on failure — never leaks raw Selenium exceptions to callers."""
    driver = _make_driver(headless=headless)  # raises ScanError on init failure
    try:
        return _run_scan(driver, url)
    except ScanError:
        raise
    except TimeoutException as exc:
        raise ScanError(
            "timeout",
            "The page took too long to load.",
            getattr(exc, "msg", "") or type(exc).__name__,
        ) from exc
    except WebDriverException as exc:
        raise ScanError(
            "page_load_error",
            "Failed to load the page.",
            getattr(exc, "msg", "") or str(exc),
        ) from exc
    except Exception as exc:
        raise ScanError(
            "scan_error",
            "An unexpected error occurred during the scan.",
            type(exc).__name__,
        ) from exc
    finally:
        try:
            driver.quit()
        except Exception:
            pass


def scan_website(url):
    # Env flags (set in PowerShell before starting runserver):
    #   $env:ARGUS_HEADLESS="1"            headless Chrome (default)
    #   $env:ARGUS_HEADLESS="0"            GUI Chrome (debug only)
    #   $env:ARGUS_ALLOW_GUI_FALLBACK="1"  allow one GUI retry on headless crash
    #   $env:ARGUS_PAGE_LOAD_TIMEOUT="15"  page load timeout in seconds (default 15)
    #   $env:ARGUS_IMPLICIT_WAIT="2"       implicit wait in seconds (default 2)
    #   $env:ARGUS_MAX_LINKS="150"         max links to inspect (default 150)
    #   $env:ARGUS_HEADLESS_RETRIES="1"    headless retries on window crash (default 1)
    #   $env:ARGUS_CHROME_MAJOR="145"      Chrome major version (default 145)
    want_headless = os.getenv("ARGUS_HEADLESS", "1") != "0"
    allow_gui_fallback = os.getenv("ARGUS_ALLOW_GUI_FALLBACK", "0") == "1"

    def is_window_crash(exc: ScanError) -> bool:
        """True when Chrome lost its window context during a headless scan."""
        if exc.error_code == "browser_closed":
            return True
        if exc.error_code == "page_load_error":
            d = exc.details.lower()
            return (
                "no such window" in d
                or "web view not found" in d
                or "target window already closed" in d
            )
        return False

    # --- Initial attempt + headless retries ---
    # Total headless attempts = 1 (initial) + _HEADLESS_RETRIES
    last_exc = None
    for attempt in range(1 + _HEADLESS_RETRIES):
        try:
            return _attempt(url, headless=want_headless)
        except ScanError as exc:
            # Only retry on window-context crashes while running headless.
            # All other errors surface immediately.
            if not (want_headless and is_window_crash(exc)):
                raise
            last_exc = exc

    # --- All headless attempts exhausted ---
    if allow_gui_fallback:
        return _attempt(url, headless=False)

    raise ScanError(
        "page_load_error",
        "Failed to load the page.",
        "Headless browser crashed; retries exhausted.",
    )
