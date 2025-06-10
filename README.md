Personal Budget Tracker Application
This is a full-stack personal budget tracker application designed to help users manage their income, expenses, and overall financial health. It features authentication, transaction management, budget tracking, and financial summaries with data visualization.

Project Overview
The application is split into two main components:

Backend: Developed with Django and Django REST Framework, providing secure API endpoints for all financial data and user authentication.

Frontend: Built with React, offering a user-friendly interface to interact with the backend, visualize financial data, and manage budget entries and transactions.

Local Development Setup
Follow these steps to set up and run the application on your local machine.

Prerequisites
Python 3.8+

Node.js (LTS version recommended)

npm (comes with Node.js) or Yarn

Git

Backend Setup (Django REST Framework)
Navigate to the backend directory:

cd backend

Create and activate a Python virtual environment (recommended):

python -m venv venv
# On Windows:
# .\venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

Install backend dependencies:

pip install -r requirements.txt # (Assuming you have a requirements.txt file)

If you don't have a requirements.txt file, you'll need to install Django, Django REST Framework, and django-cors-headers manually:

pip install Django djangorestframework django-cors-headers

Apply database migrations:

python manage.py makemigrations
python manage.py migrate

Create a Superuser (for initial access/admin):

python manage.py createsuperuser
# Follow the prompts to create a username, email, and password.

Note: For the deployed version, users will register via the frontend signup page.

Run the backend server:

python manage.py runserver

The backend will typically run on http://localhost:8000.

Frontend Setup (React)
Open a new terminal window.

Navigate to the frontend directory:

cd frontend

Install frontend dependencies:

npm install --legacy-peer-deps

The --legacy-peer-deps flag is often useful for resolving dependency conflicts with older packages.

Run the frontend development server:

npm start

The frontend will typically open in your browser at http://localhost:3000.

Local Application Flow
When you open http://localhost:3000, it will prompt you to the signup page.

Do signup there by creating a new username, email, and password.

After successful signup, it will prompt you to the sign-in page.

From there, sign in with the credentials you just created.

Upon successful login, you will be led to the dashboard, where you can manage your income, expenses, and budgets.

Deployed Application & API Access
Both the frontend and backend are deployed and accessible online.

Deployed Frontend (Static Hosted Page)
Link: https://budget-tracker-app-enyc.vercel.app/

This link will automatically redirect you to the signup page upon initial access.

Deployed Backend (Django REST Framework API)
Link: https://budget-tracker-app-dp7u.onrender.com/api/?format=api

Important Note: When you visit this API root directly, you will correctly receive an HTTP 401 Unauthorized error ("detail": "Authentication credentials were not provided."). This is an intentional security measure, as most API endpoints require a valid authentication token.

How to Access and Review the API (for Examiners/Reviewers)
To fully interact with the application and observe the API in action, please follow these steps:

Access the Application's Starting Point:
Go to https://budget-tracker-app-enyc.vercel.app/

Initial Signup (Direct Prompt):
Upon landing, you will be automatically prompted to the signup page.

Please sign up for a new account (e.g., use examiner_user for username, test@example.com for email, and your_chosen_password for password).

Click "Sign Up."

Proceed to Sign In:

After successful signup, the application will automatically redirect you to the sign-in page.

Use the exact credentials (username and password) you just created during signup to log in.

Click "Sign In."

Explore the Dashboard and Observe API Calls:

Upon successful sign-in, you will be directed to the dashboard page.

Now, open your browser's Developer Tools (usually by pressing F12 on Windows/Linux, or Cmd+Opt+I on Mac).

Navigate to the 'Network' tab within the Developer Tools.

As you interact with the dashboard (e.g., adding a transaction, adding a budget, viewing financial summaries, filtering transactions, or even just refreshing the page), you will see all the API calls being made by the frontend to the backend. These will include calls to endpoints like /transactions/, /budgets/, /categories/, and /summary/.

You can click on individual network requests in the 'Network' tab to inspect:

Status Code: Confirm it's 200 OK (indicating a successful request).

Request Headers: Observe the Authorization: Token <your_token> header being sent, demonstrating authenticated access.

Response Tab: View the actual JSON data returned by the backend for that specific query.

This approach demonstrates the full user journey, from secure registration and login to interacting with authenticated API endpoints, providing a comprehensive view of your application's functionality and security.

Key Technologies Used
Backend:

Python

Django

Django REST Framework

Djoser (for authentication)

PostgreSQL (or SQLite for local development)

django-cors-headers

Frontend:

React

Material-UI (MUI)

D3.js (for charts)

react-router-dom

Axios (for API calls)

date-fns

Contact
For any queries, please feel free to reach out.
