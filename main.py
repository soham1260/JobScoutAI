from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException
import time
import pandas as pd
import numpy as np
from selenium.webdriver.chrome.service import Service
from pymongo import MongoClient
from selenium.webdriver.chrome.options import Options
import datetime
import os
from dotenv import load_dotenv
from pyvirtualdisplay import Display
import os, time, random, pickle
from pyvirtualdisplay import Display
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
import tempfile

load_dotenv()

def safe_get_text(driver, xpath, retries=3, delay=1, direct_text_only=False):
    for attempt in range(retries):
        try:
            elem = driver.find_element(By.XPATH, xpath)

            if direct_text_only:
                text = driver.execute_script("""
                    let el = arguments[0];
                    for (let node of el.childNodes) {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
                            return node.textContent.trim();
                        }
                    }
                    return null;
                """, elem)
            else:
                text = elem.text

            if text is None or text.strip() == "":
                return np.nan
            return text.strip()

        except (NoSuchElementException, StaleElementReferenceException):
            if attempt < retries - 1:
                time.sleep(delay)
            else:
                return np.nan
            

class LinkedIn:
    def __init__(self,
                 profile_dir="/tmp/chrome-profile",
                 cookies_file="/app/cookies.pkl",
                 xvfb_display=":99",
                 screen=(1920, 1080, 24)):
        self.mail = os.getenv("LINKEDIN_EMAIL")
        self.password = os.getenv("LINKEDIN_PASSWORD")
        self.cookies_file = cookies_file

        self.display = Display(visible=1, size=(1920, 1080), backend="xvfb")
        self.display.start()

        options = Options()
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_argument(f"--user-data-dir={tempfile.mkdtemp()}")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option("useAutomationExtension", False)

        self.chrome_web = Service("/usr/bin/chromedriver")
        self.driver = webdriver.Chrome(service=self.chrome_web, options=options)


        # run CDP stealth scripts AFTER driver is created
        try:
            self.driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
                "source": """
                    // navigator.webdriver
                    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                    // minimal window.chrome
                    window.chrome = window.chrome || { runtime: {} };
                    // languages/plugins
                    Object.defineProperty(navigator, 'languages', { get: () => ['en-US','en'] });
                    Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3,4,5] });
                """
            })
        except Exception as e:
            print("CDP injection warning:", e)
        
        self.data = {'Designation': [],
                     'Name': [],
                     'Location': [],
                     'employment_type': [],
                     'work_type': [],
                     'Total_applicants': [],
                     'Industry':[],
                     'Employee_count': [],
                     'LinkedIn_Followers': []
                     }

    def login(self):
        #self.driver.maximize_window()
        self.driver.get('https://www.linkedin.com/login')
        mail_box = self.driver.find_element(By.ID, "username")
        mail_box.send_keys(self.mail)

        password_box = self.driver.find_element(By.ID, "password")
        password_box.send_keys(self.password)
        button = self.driver.find_element(By.CLASS_NAME, "btn__primary--large")
        time.sleep(0.5)
        button.click()

    
                
    def data_collection(self, link):
        self.driver.get(link)
        time.sleep(15)

        page_data = {
            'Designation': [],
            'Name': [],
            'Location': [],
            'employment_type': [],
            'work_type': [],
            'Total_applicants': [],
            'Industry': [],
            'Employee_count': [],
            'LinkedIn_Followers': []
        }
        
        for i in range(1, 21):
            time.sleep(0.5)
            jobs = None
            base_div = None
            xpaths = [
                (6, f'/html/body/div[6]/div[3]/div[4]/div/div/main/div/div[2]/div[1]/div/ul/li[{i}]'),
                (5, f'/html/body/div[5]/div[3]/div[4]/div/div/main/div/div[2]/div[1]/div/ul/li[{i}]')
            ]

            for div_index, path in xpaths:
                try:
                    jobs = self.driver.find_element(By.XPATH, path)
                    self.driver.execute_script("arguments[0].scrollIntoView();", jobs)
                    time.sleep(0.5)
                    jobs.click()
                    time.sleep(0.5)
                    base_div = div_index
                    break
                except NoSuchElementException:
                    continue

            if jobs is None:
                print(f"!!!!!!!!!!! Job listing {i} not found in both div[5] and div[6].\n")
                continue

            try:
                designation = safe_get_text(
                    self.driver,
                    f'/html/body/div[{base_div}]/div[3]/div[4]/div/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[1]/div/div[1]/div/div[1]/div/div[2]/div/h1/a'
                )
                page_data['Designation'].append(designation)
            except NoSuchElementException:
                page_data['Designation'].append(np.nan)

            try:
                company_name = safe_get_text(
                    self.driver,
                    f'/html/body/div[{base_div}]/div[3]/div[4]/div/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[1]/div/div[1]/div/div[1]/div/div[1]/div[1]/div/a'
                )
                page_data['Name'].append(company_name)
            except NoSuchElementException:
                page_data['Name'].append(np.nan)

            try:
                com_location = safe_get_text(
                    self.driver,
                    f'/html/body/div[{base_div}]/div[3]/div[4]/div/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[1]/div/div[1]/div/div[1]/div/div[3]/div/span/span[1]'
                )
                page_data['Location'].append(com_location)
            except NoSuchElementException:
                page_data['Location'].append(np.nan)

            try:
                xpath =f"/html/body/div[{base_div}]/div[3]/div[4]/div/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[1]/div/div[1]/div/div[1]/div/div[4]/button"
                buttons = self.driver.find_elements(By.XPATH, xpath)
                texts = [safe_get_text(self.driver, f"({xpath})[{i+1}]") for i in range(len(buttons))]
                et = np.nan
                wt = np.nan
                for text in texts:
                    if text == "Full-time":
                        et = "Full-time"
                    elif text == "Internship":
                        et = "Internship"
                    elif text == "Contract":
                        et = "Contract"
                    elif text == "Temporary":
                        et = "Temporary"
                    elif text == "Remote":
                        wt = "Remote"
                    elif text == "On-site":
                        wt = "On-site"
                    elif text == "Hybrid":
                        wt = "Hybrid"
                page_data['employment_type'].append(et)
                page_data['work_type'].append(wt)
            except NoSuchElementException:
                page_data['employment_type'].append(np.nan)
                page_data['work_type'].append(np.nan)
            time.sleep(1)

            try:
                num_of_applicants = safe_get_text(self.driver, f'/html/body/div[{base_div}]/div[3]/div[4]/div/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[1]/div/div[1]/div/div[1]/div/div[3]/div/span/span[5]')
                page_data['Total_applicants'].append(num_of_applicants)
            except NoSuchElementException:
                page_data['Total_applicants'].append(np.nan)
            time.sleep(1)

            try:
                Industry = safe_get_text(self.driver, f'/html/body/div[{base_div}]/div[3]/div[4]/div/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[1]/div/section/section/div[1]/div[2]',direct_text_only=True)
                page_data['Industry'].append(Industry)
            except NoSuchElementException:
                page_data['Industry'].append(np.nan)

            try:
                Employee_count = safe_get_text(self.driver, f'/html/body/div[{base_div}]/div[3]/div[4]/div/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[1]/div/section/section/div[1]/div[2]/span[1]')
                page_data['Employee_count'].append(Employee_count)
            except NoSuchElementException:
                page_data['Employee_count'].append(np.nan)


            try:
                followers = safe_get_text(self.driver, f'/html/body/div[{base_div}]/div[3]/div[4]/div/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[1]/div/section/section/div[1]/div[1]/div/div[2]/div[2]')
                page_data['LinkedIn_Followers'].append(followers)
            except NoSuchElementException:
                page_data['LinkedIn_Followers'].append(np.nan)
                
        page_df = pd.DataFrame(page_data)
        page_df['date'] = datetime.datetime.now()
        return page_df

    def create_and_store(self,page_df):
        if page_df.empty:
            print("page_df is empty. Skipping insertion.")
            return
        if isinstance(self.data, dict):
            self.data = pd.DataFrame(self.data)
        self.data = pd.concat([self.data, page_df], ignore_index=True)
        print(page_df)
        client = MongoClient(os.getenv("MONGODB_URL"))
        db = client['JobScoutAI_DB']
        collection = db['DailyData']
        records = page_df.to_dict(orient='records')
        collection.insert_many(records)

        print(f"{len(records)} records inserted successfully!")


obj = LinkedIn()
obj.login()
flag = [i for i in range(0, 500, 25)]
flag.remove(0)
flag.insert(0, 1)
for i in flag:
    page_df = obj.data_collection(f'https://www.linkedin.com/jobs/search/?currentJobId=4304009679&start={i}')
    obj.create_and_store(page_df)

obj.data.to_csv('hello.csv', index=False)
