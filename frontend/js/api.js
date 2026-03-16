console.log("Api.js loading...");
// Use relative path since we are now serving frontend from backend
const API_BASE_URL = '/api';

class ApiService {
    static async handleResponse(response) {
        if (response.status === 401) {
            console.warn("Unauthorized access - redirecting to login");
            sessionStorage.clear();
            window.location.href = '/';
            return { error: 'Unauthorized' };
        }
        return await response.json();
    }

    static async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            return await response.json(); // Login shouldn't auto-redirect on 401 (invalid creds)
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async register(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            // Register doesn't need auth, so standard json parse is fine
            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    static async logout() {
        try {
            const response = await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST'
            });
            return await response.json();
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    static async getDashboardData() {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Dashboard data error:', error);
            throw error;
        }
    }

    static async getExpenses() {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get expenses error:', error);
            throw error;
        }
    }

    static async addExpense(expenseData) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expenseData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Add expense error:', error);
            throw error;
        }
    }

    static async updateExpense(expenseId, expenseData) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expenseData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Update expense error:', error);
            throw error;
        }
    }

    static async deleteExpense(expenseId) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
                method: 'DELETE'
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Delete expense error:', error);
            throw error;
        }
    }

    static async addIncome(incomeData) {
        try {
            const response = await fetch(`${API_BASE_URL}/income`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(incomeData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Add income error:', error);
            throw error;
        }
    }

    static async getIncomes() {
        try {
            const response = await fetch(`${API_BASE_URL}/income`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get incomes error:', error);
            throw error;
        }
    }

    static async deleteIncome(incomeId) {
        try {
            const response = await fetch(`${API_BASE_URL}/income/${incomeId}`, {
                method: 'DELETE'
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Delete income error:', error);
            throw error;
        }
    }

    static async sendChatMessage(message) {
        try {
            const response = await fetch(`${API_BASE_URL}/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Chatbot error:', error);
            throw error;
        }
    }
}
