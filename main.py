from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException
import time
import pandas as pd
import numpy as np
from selenium.webdriver.chrome.service import Service

class LinkedIn:
    def __init__(self):
        self.mail = "check@email.com"
        self.password = "ahhbysj"

        self.chrome_web = Service(r"D:\LinkedIn_Job_Analytics-main\LinkedIn_Job_Analytics-main\chromedriver-win64\chromedriver-win64\chromedriver.exe")
        self.driver = webdriver.Chrome(service=self.chrome_web)
        
        self.data = {'Designation': [],
                     'Name': [],
                     'Location': []
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
        time.sleep(10)

        bar = self.driver.find_element(By.XPATH, '/html')
        
        for i in range(1, 2):
            time.sleep(0.5)
            jobs = self.driver.find_element(By.XPATH, f'/html/body/div[5]/div[3]/div[4]/div/div/main/div/div[2]/div[1]/div/ul/li[{i}]/div/div')
            self.driver.execute_script("arguments[0].scrollIntoView();", jobs)
            time.sleep(0.5)
            jobs.click()
            time.sleep(0.5)
            try:
                job_title = self.driver.find_element(By.XPATH, '/html/body/div[6]/div[3]/div[4]/div/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[1]/div/div[1]/div/div[1]/div/div[2]/div/h1/a')
                self.data['Designation'].append(job_title.text)
            except NoSuchElementException:
                self.data['Designation'].append(np.nan)
            time.sleep(0.5)

            try:
                company_name = self.driver.find_element(By.XPATH, '/html/body/div[6]/div[3]/div[4]/div/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[1]/div/div[1]/div/div[1]/div/div[1]/div[1]/div/a')
                self.data['Name'].append(company_name.text)
            except NoSuchElementException:
                self.data['Name'].append(np.nan)
            time.sleep(1)

            try:
                com_location = self.driver.find_element(By.XPATH, '/html/body/div[6]/div[3]/div[4]/div/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[1]/div/div[1]/div/div[1]/div/div[3]/div/span/span[1]')
                self.data['Location'].append(com_location.text)
            except NoSuchElementException:
                self.data['Location'].append(np.nan)
            time.sleep(1)

    def create_and_store(self):
        df = pd.DataFrame(self.data)
        print(df)
        df.to_csv('jobs.csv', index=False)


obj = LinkedIn()
obj.login()
flag = [i for i in range(0, 51, 25)]
flag.remove(0)
flag.insert(0, 1)
for i in flag:
    obj.data_collection(f'https://www.linkedin.com/jobs/search/?currentJobId=4304009679&start={i}')

obj.create_and_store()
