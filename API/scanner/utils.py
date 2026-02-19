import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
import time


def scan_website(url):
    options = uc.ChromeOptions()
    # Arka planda çalışsın, pencere açılmasın
    options.add_argument('--headless')
    driver = uc.Chrome(options=options)

    try:
        driver.get(url)
        time.sleep(3)  # Sayfanın yüklenmesini bekle

        # Analiz verilerini topla
        data = {
            "title": driver.title,
            "url": url,
            "total_links": len(driver.find_elements(By.TAG_NAME, 'a')),
            "risk_score": 0,  # Şimdilik 0, analiz mantığını sonra ekleyeceğiz
            "is_sponsored": False
        }
        return data
    finally:
        driver.quit()
