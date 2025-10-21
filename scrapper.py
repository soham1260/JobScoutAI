from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException
import time
import numpy as np
from selenium.webdriver.chrome.service import Service

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
    def __init__(self):
        self.mail = ""
        self.password = ""

        self.chrome_web = Service(r"D:\LinkedIn_Job_Analytics-main\LinkedIn_Job_Analytics-main\chromedriver-win64\chromedriver-win64\chromedriver.exe")
        self.driver = webdriver.Chrome(service=self.chrome_web)
        
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
        self.driver.maximize_window()
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
        time.sleep(5)

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
                (6, f'/html/body/div[6]/div[4]/div[4]/div/div/main/div/div[2]/div[1]/div/ul/li[{i}]'),
                (5, f'/html/body/div[5]/div[4]/div[4]/div/div/main/div/div[2]/div[1]/div/ul/li[{i}]')
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
                    f'/html/body/div[{base_div}]/div[4]/div[4]/div/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[1]/div/div[1]/div/div[1]/div/div[2]/div/h1/a'
                )
                page_data['Designation'].append(designation)
            except NoSuchElementException:
                page_data['Designation'].append(np.nan)

            try:
                company_name = safe_get_text(
                    self.driver,
                    f'/html/body/div[{base_div}]/div[4]/div[4]/div/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[1]/div/div[1]/div/div[1]/div/div[1]/div[1]/div/a'
                )
                page_data['Name'].append(company_name)
            except NoSuchElementException:
                page_data['Name'].append(np.nan)

obj = LinkedIn()
obj.login()
flag = [i for i in range(0, 500, 25)]
flag.remove(0)
flag.insert(0, 1)
for i in flag:
    page_df = obj.data_collection(f'https://www.linkedin.com/jobs/search/?currentJobId=4304009679&start={i}')
    obj.create_and_store(page_df)

obj.data.to_csv('hello.csv', index=False)