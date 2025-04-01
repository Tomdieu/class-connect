import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import WebDriverException
from apscheduler.schedulers.blocking import BlockingScheduler
import logging
from fake_useragent import UserAgent

# Configure logging
logging.basicConfig(
    filename='organic_traffic.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Configuration
SEARCH_KEYWORDS = [
    ('classconnect fr', 'https://classconnect.com/fr'),
    ('classconnect english version', 'https://classconnect.com/en'),
    ('classconnect pricing plans', 'https://classconnect.com/en/pricing'),
    ('classconnect contact support', 'https://classconnect.com/fr/contact'),
    ('classconnect faq help', 'https://classconnect.com/en/faq'),
    ('classconnect privacy policy', 'https://classconnect.com/fr/privacy')
]
DELAY_RANGE = (8, 25)
VISITS_PER_SESSION = 3
RUN_EVERY_MINUTES = 1

def get_driver():
    """Create a headless Chrome driver with random settings"""
    logging.info("Creating new WebDriver instance")
    try:
        ua = UserAgent()
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument(f"user-agent={ua.random}")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        driver = webdriver.Chrome(options=chrome_options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        logging.info("WebDriver created successfully")
        return driver
    except Exception as e:
        logging.error(f"Failed to create WebDriver: {str(e)}")
        raise

def perform_google_search(driver, keyword):
    """Perform Google search and click organic result"""
    logging.info(f"Starting Google search for keyword: {keyword}")
    try:
        driver.get("https://www.google.com")
        logging.info("Navigated to Google homepage")
        
        time.sleep(random.uniform(1, 3))
        search_box = driver.find_element(By.NAME, 'q')
        logging.info("Located search box")
        
        for char in keyword:
            search_box.send_keys(char)
            time.sleep(random.uniform(0.05, 0.2))
        logging.info(f"Typed keyword: {keyword}")
        
        time.sleep(random.uniform(0.5, 1.5))
        search_box.send_keys(Keys.RETURN)
        logging.info("Submitted search query")
        
        time.sleep(random.uniform(2, 4))
        organic_results = driver.find_elements(By.CSS_SELECTOR, "div.g a")
        logging.info(f"Found {len(organic_results)} search results")
        
        for result in organic_results:
            href = result.get_attribute('href')
            if href and 'classconnect.com' in href:
                logging.info(f"Found organic result: {href}")
                driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", result)
                time.sleep(random.uniform(0.5, 1.5))
                result.click()
                logging.info(f"Clicked on organic result: {href}")
                return True
        logging.warning("No matching organic result found")
        return False
    except Exception as e:
        logging.error(f"Search failed: {str(e)}")
        return False

def simulate_organic_visit(driver):
    """Simulate organic browsing session"""
    logging.info("Starting organic browsing session")
    try:
        keyword, target_url = random.choice(SEARCH_KEYWORDS)
        logging.info(f"Selected keyword: {keyword}, target URL: {target_url}")
        
        if not perform_google_search(driver, keyword):
            logging.error("Failed to find organic result")
            return
        
        time.sleep(random.uniform(2, 4))
        current_url = driver.current_url
        logging.info(f"Current URL after search: {current_url}")
        
        if target_url not in current_url:
            logging.warning(f"Landed on unexpected URL: {current_url}")
        
        internal_pages = random.sample(
            [url for url in SEARCH_KEYWORDS if url[1] != current_url],
            min(VISITS_PER_SESSION-1, len(SEARCH_KEYWORDS)-1)
        )
        logging.info(f"Generated browsing path: {internal_pages}")
        
        for page in internal_pages:
            logging.info(f"Navigating to internal page: {page[1]}")
            driver.get(page[1])
            time.sleep(random.uniform(*DELAY_RANGE))
            scroll_depth = random.choice(["window.scrollBy(0, 500)", "window.scrollTo(0, document.body.scrollHeight)"])
            driver.execute_script(scroll_depth)
            logging.info(f"Scrolled page: {page[1]}")
            time.sleep(random.uniform(2, 5))
            
            if random.random() > 0.7:
                links = driver.find_elements(By.TAG_NAME, 'a')
                if links:
                    random_link = random.choice(links)
                    try:
                        random_link.click()
                        logging.info("Clicked on a random link")
                        time.sleep(random.uniform(3, 8))
                    except Exception as e:
                        logging.warning(f"Failed to click random link: {str(e)}")
        
        time.sleep(random.uniform(5, 10))
        logging.info("Completed browsing session")
    except Exception as e:
        logging.error(f"Browsing simulation failed: {str(e)}")
        raise

def traffic_task():
    """Main task to be scheduled"""
    session_id = random.randint(10000, 99999)
    logging.info(f"=== Starting organic session #{session_id} ===")
    
    driver = None
    try:
        driver = get_driver()
        start_time = time.time()
        simulate_organic_visit(driver)
        duration = time.time() - start_time
        logging.info(f"Completed organic session #{session_id} in {duration:.2f}s")
    except Exception as e:
        logging.error(f"Session #{session_id} failed: {str(e)}")
    finally:
        if driver:
            driver.quit()
        logging.info(f"=== Ended session #{session_id} ===")

if __name__ == "__main__":
    logging.info("Starting organic traffic simulation")
    
    scheduler = BlockingScheduler()
    scheduler.add_job(
        traffic_task,
        'interval',
        minutes=RUN_EVERY_MINUTES,
        jitter=120
    )
    
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logging.info("Stopped by user")
    finally:
        logging.info("Organic traffic simulation terminated")
