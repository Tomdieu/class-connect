import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import WebDriverException
from apscheduler.schedulers.blocking import BlockingScheduler
import logging
from fake_useragent import UserAgent

# Configure logging
logging.basicConfig(
    filename='website_traffic.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Configuration
URLS = [
    'https://classconnect.com/fr',
    'https://classconnect.com/en',
    'https://classconnect.com/en/contact',
    'https://classconnect.com/fr/pricing',
    'https://classconnect.com/fr/contact',
    'https://classconnect.com/en/pricing',
    'https://classconnect.com/fr/faq',
    'https://classconnect.com/en/faq',
    'https://classconnect.com/fr/help',
    'https://classconnect.com/en/help',
    'https://classconnect.com/fr/privacy',
    'https://classconnect.com/en/privacy',
]
DELAY_RANGE = (5, 15)  # Seconds between actions
VISITS_PER_SESSION = 3
RUN_EVERY_MINUTES = 60  # Run every hour

def get_driver():
    """Create a headless Chrome driver with random user agent"""
    logging.info("Creating new WebDriver instance")
    try:
        ua = UserAgent()
        user_agent = ua.random
        logging.info(f"Using User-Agent: {user_agent}")
        
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument(f"user-agent={user_agent}")
        
        driver = webdriver.Chrome(options=chrome_options)
        logging.info("WebDriver created successfully")
        return driver
    except Exception as e:
        logging.error(f"Failed to create WebDriver: {str(e)}")
        raise

def simulate_visit(driver):
    """Simulate a single website visit"""
    try:
        # Randomly select URLs to visit
        urls_to_visit = random.sample(URLS, min(VISITS_PER_SESSION, len(URLS)))
        logging.info(f"Selected {len(urls_to_visit)} URLs to visit in this session")
        
        for i, url in enumerate(urls_to_visit, 1):
            logging.info(f"Visit {i}/{len(urls_to_visit)}: Navigating to {url}")
            start_time = time.time()
            driver.get(url)
            load_time = time.time() - start_time
            logging.info(f"Page loaded in {load_time:.2f} seconds")
            
            # Random delay to simulate reading time
            read_time = random.uniform(*DELAY_RANGE)
            logging.info(f"Simulating reading for {read_time:.2f} seconds")
            time.sleep(read_time)
            
            # Simulate scrolling
            scroll_count = random.randint(2, 5)
            logging.info(f"Performing {scroll_count} scroll actions")
            
            for scroll_num in range(1, scroll_count + 1):
                scroll_pause = random.uniform(0.5, 1.5)
                logging.info(f"Scroll {scroll_num}/{scroll_count} with {scroll_pause:.2f}s pause")
                driver.execute_script("window.scrollBy(0, window.innerHeight)")
                time.sleep(scroll_pause)
            
            logging.info(f"Completed visit to {url}")
            
    except WebDriverException as e:
        logging.error(f"Browser error during site visit: {str(e)}")
        raise
    except Exception as e:
        logging.error(f"General error during site visit: {str(e)}")
        raise

def traffic_task():
    """Main task to be scheduled"""
    session_id = random.randint(10000, 99999)
    logging.info(f"=== Starting traffic simulation session #{session_id} ===")
    
    driver = None
    try:
        driver = get_driver()
        start_time = time.time()
        simulate_visit(driver)
        duration = time.time() - start_time
        logging.info(f"Successfully completed traffic simulation session #{session_id} in {duration:.2f} seconds")
    except Exception as e:
        logging.error(f"Failed to complete traffic simulation session #{session_id}: {str(e)}")
    finally:
        if driver:
            logging.info("Closing WebDriver")
            driver.quit()
        logging.info(f"=== Ended traffic simulation session #{session_id} ===")

if __name__ == "__main__":
    logging.info("Starting website traffic simulation program")
    
    # Initial run
    logging.info("Performing initial traffic simulation run")
    traffic_task()
    
    # Set up scheduler
    logging.info(f"Setting up scheduler to run every {RUN_EVERY_MINUTES} minutes")
    scheduler = BlockingScheduler()
    scheduler.add_job(
        traffic_task,
        'interval',
        minutes=RUN_EVERY_MINUTES,
        id='website_traffic'
    )
    
    try:
        logging.info("Scheduler started")
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logging.info("Scheduler stopped by user")
    finally:
        logging.info("Website traffic simulation program terminated")