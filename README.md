# 💰 Smart Expense Tracker with AI Chatbot

> A full-stack financial management application featuring data visualization and an integrated AI assistant.

Welcome to the **Smart Expense Tracker**! This project is a modern web application designed to help users take control of their personal finances. It goes beyond simple data entry by providing visual analytics and a **conversational AI chatbot** that allows users to query their financial data using natural language.

---

## 🚀 Key Features

### 📊 Interactive Dashboard
-   **Real-time Analytics:** Visualizes spending habits using dynamic charts (Chart.js).
-   **Financial Health:** Instantly view Total Income, Total Expenses, and Current Balance.
-   **Recent Activity:** Quick view of the latest transactions.

### 🤖 AI Financial Assistant
-   **Natural Language Queries:** Ask questions like *"How much did I spend on food?"* or *"What is my balance?"*.
-   **Smart Insights:** The chatbot analyzes database records to provide instant answers without navigating complex menus.

### 🔐 Security & Management
-   **Secure Authentication:** User registration and login system with password hashing for security.
-   **CRUD Operations:** Full capability to Create, Read, Update, and Delete both income and expense records.
-   **Category Management:** Organize spending into categories like Food, Transportation, Utilities, etc.

## 🛠️ Technology Stack

This project demonstrates proficiency in full-stack web development:

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Chart.js |
| **Backend** | Python 3, Flask (RESTful API) |
| **Database** | SQLite, SQLAlchemy ORM |
| **Authentication** | Session-based Auth, Werkzeug Security |

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
- Python 3.8 or higher
- Git

### Step-by-Step Guide

1.  **Clone the Repository**
    ```bash
    git clone <your-repo-url>
    cd expense-tracker/backend
    ```

2.  **Set Up Virtual Environment** (Recommended)
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate

    # macOS/Linux
    source venv/bin/activate
    ```

3.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Application**
    ```bash
    python app.py
    ```

5.  **Access the App**
    Open your browser and navigate to: `http://127.0.0.1:5000`

    *Note: The database (`expense_tracker.db`) is created automatically upon the first run.*


![1](https://github.com/user-attachments/assets/fb237c23-c77b-440a-964b-0d0fc2e6196a)


![2](https://github.com/user-attachments/assets/b74fe326-7877-4614-be84-a9c067e7213b)


![3](https://github.com/user-attachments/assets/92b87925-c746-4c87-a9cb-bc57c1f7b1fc)


![4](https://github.com/user-attachments/assets/0270d9fc-d666-4321-8bec-abe8ddbafe5f)


## 📡 API Reference

The backend exposes a RESTful API to handle data operations.

| Endpoint              | Method | Description                                | Requires Auth |
| --------------------- | ------ | -----------------------------------------  | ------------- |
| `/api/register`       | `POST` | Registers a new user.                      | No            |
| `/api/login`          | `POST` | Authenticates a user and returns a token.  | No            |
| `/api/expenses`       | `GET`  | Retrieves all expenses for the user.       | Yes           |
| `/api/expenses`       | `POST` | Adds a new expense for the logged-in user. | Yes           |
| `/api/expenses/<id>`  | `DELETE`| Deletes a specific expense by its ID.     | Yes           |
| `/api/dashboard`      | `GET`  | Gets dashboard statistics for the user.    | Yes           |
| `/api/chatbot`        | `POST` | Sends a message to the AI chatbot.         | Yes           |

## 📂 Project Structure

```
expense-tracker/
├── backend/
│   ├── app.py              # Main Flask Application
│   ├── expense_tracker.db  # SQLite Database
│   └── requirements.txt    # Python Dependencies
└── frontend/
    ├── index.html          # Login/Register Page
    ├── dashboard.html      # Main User Interface
    ├── css/                # Stylesheets
    └── js/                 # Client-side Logic (Auth, API, Charts)
```




