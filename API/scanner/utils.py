# flake8: noqa
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
        driver.set_page_load_timeout(35)
        driver.implicitly_wait(5)
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

    driver.get(url)
    _switch_to_alive_window(driver)

    WebDriverWait(driver, 12).until(
        EC.presence_of_element_located((By.TAG_NAME, "body")))
    time.sleep(1)

    links = driver.find_elements(By.TAG_NAME, "a")
    total_links = len(links)

    suspicious_links = []
    for l in links:
        href = l.get_attribute("href")
        if not href:
            continue
        href_l = href.lower()
        if any(m in href_l for m in affiliate_markers):
            suspicious_links.append(href)

    page_text = driver.find_element(By.TAG_NAME, "body").text.lower()
    found_keywords = [
        word for word in suspicious_keywords if word in page_text]

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

    # --- Attempt 1: run as configured by ARGUS_HEADLESS ---
    try:
        return _attempt(url, headless=want_headless)
    except ScanError as exc1:
        # Only activate retry logic when we were running headless AND it was
        # specifically a window-context crash.  All other errors surface immediately.
        if not (want_headless and is_window_crash(exc1)):
            raise

    # --- Attempt 2: fresh headless retry ---
    try:
        return _attempt(url, headless=True)
    except ScanError as exc2:
        if not allow_gui_fallback:
            raise ScanError(
                "page_load_error",
                "Failed to load the page.",
                "Headless browser crashed; GUI fallback disabled.",
            ) from exc2

    # --- Attempt 3: GUI fallback (only when ARGUS_ALLOW_GUI_FALLBACK=1) ---
    return _attempt(url, headless=False)
