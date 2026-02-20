# flake8: noqa
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
import time


def scan_website(url):
    options = uc.ChromeOptions()
    options.add_argument('--headless')
    driver = uc.Chrome(options=options)

    # Dedektif Havuzları
    affiliate_markers = ['ref=', 'tag=', 'aff=',
                         'clickid=', 'utm_medium=affiliate', 'promo=']
    suspicious_keywords = [
        'işbirliği', 'reklam', 'sponsor', 'hediye', 'promo',
        'indirim kodu', 'ortaklık', 'affiliate', 'ücretsiz deneme'
    ]

    try:
        driver.get(url)
        time.sleep(3)  # Sayfanın oturması için bekleme

        # --- 1. Link Analizi ---
        links = driver.find_elements(By.TAG_NAME, 'a')
        total_links = len(links)
        suspicious_links = [l.get_attribute('href') for l in links if l.get_attribute('href') and
                            any(m in l.get_attribute('href').lower() for m in affiliate_markers)]

        # --- 2. Anahtar Kelime Analizi ---
        # Body içindeki tüm metni çekiyoruz
        page_text = driver.find_element(By.TAG_NAME, 'body').text.lower()
        found_keywords = [
            word for word in suspicious_keywords if word in page_text]

        # --- 3. Risk Skoru Hesaplama ---
        # Temel puan: Şüpheli linklerin yoğunluğu (Max 50 puan)
        link_risk = min(len(suspicious_links) * 10,
                        50) if total_links > 0 else 0

        # Ek puan: Bulunan her anahtar kelime için +15 puan (Max 50 puan)
        keyword_risk = min(len(found_keywords) * 15, 50)

        total_risk = link_risk + keyword_risk

        return {
            "title": driver.title,
            "url": url,
            "total_links": total_links,
            "suspicious_count": len(suspicious_links),
            "detected_keywords": found_keywords,
            "risk_score": total_risk,
            "is_sponsored": total_risk > 25
        }
    finally:
        driver.quit()
