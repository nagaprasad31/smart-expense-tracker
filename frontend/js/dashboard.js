document.addEventListener('DOMContentLoaded', function () {
    if (!protectPage()) return;

    setupLogout();
    loadDashboardData();
    setupModals();
    setupExpenseForm();
    setupIncomeForm();

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expenseDate').value = today;
    document.getElementById('incomeDate').value = today;
});

let expenseChart = null;

async function loadDashboardData() {
    try {
        const data = await ApiService.getDashboardData();
        updateDashboardCards(data);
        // Chart update removed
        loadRecentTransactions();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        if (error.message.includes('401')) {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    }
}

function updateDashboardCards(data) {
    const formatCurrency = (amount) => {
        return '₹' + (amount || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    document.getElementById('totalIncome').textContent = formatCurrency(data.total_income);
    document.getElementById('totalExpenses').textContent = formatCurrency(data.total_expenses);

    const balance = data.current_balance || 0;
    const balanceElement = document.getElementById('currentBalance');
    balanceElement.textContent = formatCurrency(balance);

    const balanceCard = balanceElement.closest('.card');
    if (balance >= 0) {
        balanceCard.classList.remove('negative-balance');
        balanceCard.classList.add('positive-balance');
    } else {
        balanceCard.classList.remove('positive-balance');
        balanceCard.classList.add('negative-balance');
    }
}

// Chart function removed
function updateExpenseChart(categoryData) {
    // No-op
}

async function loadRecentTransactions() {
    try {
        const [expenses, incomes] = await Promise.all([
            ApiService.getExpenses(),
            ApiService.getIncomes()
        ]);

        const safeExpenses = Array.isArray(expenses) ? expenses.map(e => ({ ...e, type: 'expense' })) : [];
        const safeIncomes = Array.isArray(incomes) ? incomes.map(i => ({ ...i, type: 'income' })) : [];
        
        const allTransactions = [...safeExpenses, ...safeIncomes];
        
        // Sort by date descending
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        const recentTransactions = allTransactions.slice(0, 5);

        const transactionsList = document.getElementById('recentTransactionsList');

        if (recentTransactions.length === 0) {
            transactionsList.innerHTML = '<p class="no-data">No transactions yet</p>';
            return;
        }

        transactionsList.innerHTML = recentTransactions.map(item => {
            const isExpense = item.type === 'expense';
            const amount = parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
            const sign = isExpense ? '-' : '+';
            const colorStyle = isExpense ? 'color: #e74c3c;' : 'color: #2ecc71;';
            
            return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <span class="transaction-description">${item.description || item.source || (isExpense ? 'Expense' : 'Income')}</span>
                    <span class="transaction-category">${isExpense ? item.category : 'Income'}</span>
                </div>
                <div class="transaction-amount" style="${colorStyle}">${sign}₹${amount}</div>
                <div class="transaction-date">${formatDate(item.date)}</div>
                <button onclick="deleteTransaction(${item.id}, '${item.type}')" style="margin-left: 10px; border: none; background: none; color: #999; cursor: pointer; font-size: 1.2em;" title="Delete">&times;</button>
            </div>
        `}).join('');
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

window.deleteTransaction = async function(id, type) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
        if (type === 'expense') {
            await ApiService.deleteExpense(id);
        } else {
            await ApiService.deleteIncome(id);
        }
        loadDashboardData();
        showMessage('Transaction deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showMessage('Failed to delete transaction', 'error');
    }
};

function setupModals() {
    const expenseModal = document.getElementById('expenseModal');
    const incomeModal = document.getElementById('incomeModal');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const addIncomeBtn = document.getElementById('addIncomeBtn');
    const closeExpenseModal = document.getElementById('closeExpenseModal');
    const closeIncomeModal = document.getElementById('closeIncomeModal');

    addExpenseBtn.addEventListener('click', () => {
        expenseModal.style.display = 'block';
    });

    addIncomeBtn.addEventListener('click', () => {
        incomeModal.style.display = 'block';
    });

    closeExpenseModal.addEventListener('click', () => {
        expenseModal.style.display = 'none';
    });

    closeIncomeModal.addEventListener('click', () => {
        incomeModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === expenseModal) {
            expenseModal.style.display = 'none';
        }
        if (event.target === incomeModal) {
            incomeModal.style.display = 'none';
        }
    });
}

function setupExpenseForm() {
    const expenseForm = document.getElementById('expenseForm');

    expenseForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const expenseData = {
            amount: parseFloat(document.getElementById('expenseAmount').value),
            category_id: parseInt(document.getElementById('expenseCategory').value),
            description: document.getElementById('expenseDescription').value,
            date: document.getElementById('expenseDate').value
        };

        try {
            await ApiService.addExpense(expenseData);

            document.getElementById('expenseModal').style.display = 'none';
            expenseForm.reset();

            const today = new Date().toISOString().split('T')[0];
            document.getElementById('expenseDate').value = today;

            loadDashboardData();

            showMessage('Expense added successfully!', 'success');
        } catch (error) {
            console.error('Error adding expense:', error);
            showMessage('Error adding expense. Please try again.', 'error');
        }
    });
}

function setupIncomeForm() {
    const incomeForm = document.getElementById('incomeForm');

    incomeForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const incomeData = {
            amount: parseFloat(document.getElementById('incomeAmount').value),
            source: document.getElementById('incomeSource').value,
            date: document.getElementById('incomeDate').value
        };

        try {
            await ApiService.addIncome(incomeData);

            document.getElementById('incomeModal').style.display = 'none';
            incomeForm.reset();

            const today = new Date().toISOString().split('T')[0];
            document.getElementById('incomeDate').value = today;

            loadDashboardData();

            showMessage('Income added successfully!', 'success');
        } catch (error) {
            console.error('Error adding income:', error);
            showMessage('Error adding income. Please try again.', 'error');
        }
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.display = 'block';

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        document.body.removeChild(messageDiv);
    }, 3000);
}
