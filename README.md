# JobScoutAI – Full Stack Job Market Intelligence Platform

JobScoutAI is a complete end-to-end system that:
- Scrapes live job data from LinkedIn (Selenium)
- Cleans + normalizes the data (ETL pipeline)
- Generates extensive analytics
- Provides a full REST API backend (Flask)
- Renders dashboards and AI explanations (React white)

This project simulates a production-grade **Data Engineering + Backend + Frontend + AI** ecosystem.



---

#  Project Components



##  JobScoutAI – Scraper

**Tech:** Python, Selenium, MongoDB  
**Purpose:** Scrapes daily LinkedIn job listings.

###  Extracted Fields
- `Designation`
- `Name`
- `Location`
- `employment_type`
- `work_type`
- `Total_applicants`
- `Industry`
- `Employee_count`
- `LinkedIn_Followers`
- `date`

###  Output  
Stored raw in **MongoDB → DailyData**

---

## JobScoutAI – Backend (Flask API)

**Tech:** Flask, MongoDB, Pandas, Gemini AI  
**Purpose:** Cleans raw data, generates insights, serves as API layer.

###  Key Modules

###  ETL Cleaning Pipeline
- cleans applicant numbers  
- normalizes job titles  
- parses employee count ranges  
- converts dates  
- splits location → city/state/country  
- standardizes work type  
- normalizes industries  
- generates unique `job_id`  
- removes duplicates

###  Clean Data Collections
- `Company`
- `Jobs`

###  Insights Engine (18+ analytics)
Includes:
- Top hiring companies  
- Industry heatmap  
- Skill frequency  
- Seniority distribution  
- Fastest growing roles  
- Work-type distribution  
- Flex Index  
- Prestige Index  
- Role popularity  
- City hiring density  
- Industry–seniority matrix  
- Avg company size per role  
- Competition metrics  
- Best cities per role  
- Industry competitiveness  
- Hiring consistency score  
- …and more

Stored in: **`Insights_Daily`**

---

##  Gemini AI Integration



Backend:
- Fetches insight data
- Merges with user query
- Sends structured prompt to Gemini API
- Returns detailed AI-generated explanation



---

##  JobScoutAI – Frontend (React + Vite + Tailwind + Chart.js)

**Tech Stack:**  
-  React (Vite)  
-  Tailwind CSS  
-  Chart.js  
-  Axios (API calls)  
-  React Router  
-  Gemini-powered AI Assistant (via backend)

###  Features
- Dashboard with charts  
- Job search & filtering  
- Company profiles  
- Insight visualizations  
- AI Assistant (Gemini)  
- Responsive UI  

The JobScoutAI Frontend is an interactive, modern web dashboard designed to visualize all job market analytics computed by the backend. It connects directly to the Flask REST API and renders insights using elegant charts and UI components.



---


#  JobScoutAI – Project Setup Guide

This guide explains how to run the **full JobScoutAI system**, including the scraper, backend, and frontend.

---

#  1. Clone the Repository

```
git clone https://github.com/soham1260/JobScoutAI
cd JobScoutAI
```

---

#  2. Setup & Run the Scraper (LinkedIn Scraper)



###  Install dependencies
```
pip install -r requirements.txt
```

###  Set environment variables
Create a `.env` file:

```
LINKEDIN_EMAIL=your_email
LINKEDIN_PASSWORD=your_password
MONGO_URI=your_mongodb_uri
```

###  Run scraper
```
python scrapper.py
```

This will push raw job data to **MongoDB → DailyData**.

---

#  3. Run Cleaning Pipeline (Backend ETL)

```
python clean_data.py
```

This generates structured datasets:
- `Company`
- `Jobs`

Then generate insights:

```
python -m pipeline.generate_insights
```

This writes 18+ insights to `Insights_Daily`.

---

#  4. Run Backend (Flask API)

```
cd frontend
pip install -r requirements.txt
python app.py
```

Backend runs at:
```
http://127.0.0.1:5000
```

### API Includes:
- `/jobs/*`
- `/companies/*`
- `/insights/*`
- `/ai/query`

---

#  5. Run Frontend (React + Vite)

```
npm install
npm run dev
```

Frontend runs at:
```
http://localhost:5173
```

Make sure your `.env` contains:
```
VITE_API_BASE_URL="http://127.0.0.1:5000"
```

---

#  Final Workflow Summary

```
Scraper → DailyData (MongoDB)
Cleaning Pipeline → Company + Jobs
Insights Pipeline → Insights_Daily
Flask Backend → exposes APIs
React Frontend → visual dashboard
Gemini AI → answers insight queries
```

---





