# Smart Expense Tracker - Backend

Welcome to the backend repository for the Smart Expense Tracker! This Flask-based application provides the server-side logic, API, and database management for a modern expense tracking tool. It features user authentication, expense management, data visualization dashboards, and an AI-powered chatbot for a seamless user experience.

## ✨ Features

-   **User Authentication**: Secure user registration and login functionality.
-   **Expense Management (CRUD)**: Create, Read, Update, and Delete expenses.
-   **Dashboard Analytics**: Get insightful statistics about your spending habits.
-   **AI Chatbot**: Interact with an intelligent assistant to manage and inquire about your expenses.
-   **SQLite Database**: Lightweight and file-based database, perfect for easy setup and portability.

## 🛠️ Technology Stack

-   **Backend**: Flask
-   **Database**: SQLite (via Flask-SQLAlchemy)
-   **Language**: Python

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Python 3.8+
-   pip (Python package installer)
-   Git

### Installation & Setup

1.  **Clone the repository and navigate into the backend directory:**
    (Remember to replace `your-username/your-repo-name` with your actual repository URL)
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name/backend
    ```

2.  **Create and activate a virtual environment:**
    This isolates the project dependencies from your global Python environment.

    ```bash
    # Create the virtual environment
    python -m venv venv

    # Activate it
    # On Windows:
    venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the application:**
    ```bash
    python app.py
    ```

5.  The backend server will start at `http://127.0.0.1:5000`.
6.  The database file `expense_tracker.db` will be automatically created on the first run.

## API Documentation

The API is the primary way the frontend application interacts with the backend.

| Endpoint              | Method | Description                               | Requires Auth |
| --------------------- | ------ | ----------------------------------------- | ------------- |
| `/api/register`       | `POST` | Registers a new user.                     | No            |
| `/api/login`          | `POST` | Authenticates a user and returns a token. | No            |
| `/api/expenses`       | `GET`  | Retrieves all expenses for the logged-in user. | Yes           |
| `/api/expenses`       | `POST` | Adds a new expense for the logged-in user. | Yes           |
| `/api/expenses/<id>`  | `DELETE`| Deletes a specific expense by its ID.     | Yes           |
| `/api/dashboard`      | `GET`  | Gets dashboard statistics for the user.   | Yes           |
| `/api/chatbot`        | `POST` | Sends a message to the AI chatbot.        | Yes           |

*Authentication is likely handled via JWT. For protected routes, the token received from `/api/login` should be included in the `Authorization` header as a `Bearer <token>`.*

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License. You should add a `LICENSE` file to your repository with the contents of the MIT License.
