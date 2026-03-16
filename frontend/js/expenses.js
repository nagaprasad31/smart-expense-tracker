document.addEventListener('DOMContentLoaded', function () {
    if (!protectPage()) return;

    setupLogout();
    loadExpenses();
    setupExpenseModal();
    setupFilters();
});

let allExpenses = [];
let filteredExpenses = [];
let editingExpenseId = null;

async function loadExpenses() {
    try {
        allExpenses = await ApiService.getExpenses();
        if (!Array.isArray(allExpenses)) {
            console.error("Expenses is not an array:", allExpenses);
            allExpenses = [];
        }
        filteredExpenses = [...allExpenses];
        displayExpenses(filteredExpenses);
        updateExpenseStats(filteredExpenses);
        renderDailyExpensesChart(filteredExpenses); // Use filtered expenses for the chart
    } catch (error) {
        console.error('Error loading expenses:', error);
        if (error.message && error.message.includes('401')) {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    }
}

function displayExpenses(expenses) {
    const expensesList = document.getElementById('expensesList');

    if (expenses.length === 0) {
        expensesList.innerHTML = '<div class="no-data">No expenses found</div>';
        return;
    }

    const categoryMap = {
        1: 'Food & Dining',
        2: 'Transportation',
        3: 'Shopping',
        4: 'Entertainment',
        5: 'Bills & Utilities',
        6: 'Healthcare',
        7: 'Others'
    };

    expensesList.innerHTML = expenses.map(expense => `
        <div class="expense-item" data-expense-id="${expense.id}">
            <div class="expense-info">
                <div class="expense-main">
                    <span class="expense-description">${expense.description || 'No description'}</span>
                    <span class="expense-amount">₹${parseFloat(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="expense-meta">
                    <span class="expense-category">
                        <span class="category-dot" style="background-color: ${getCategoryColor(expense.category)}"></span>
                        ${expense.category}
                    </span>
                    <span class="expense-date">${formatDate(expense.date)}</span>
                </div>
            </div>
            <div class="expense-actions">
                <button class="btn-edit" onclick="editExpense(${expense.id})">Edit</button>
                <button class="btn-delete" onclick="deleteExpense(${expense.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateExpenseStats(expenses) {
    const count = expenses.length;
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    document.getElementById('expenseCount').textContent = `${count} expense${count !== 1 ? 's' : ''}`;
    document.getElementById('expenseTotal').textContent = `Total: ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function setupExpenseModal() {
    const modal = document.getElementById('expenseModal');
    const addNewExpenseBtn = document.getElementById('addNewExpenseBtn');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const expenseForm = document.getElementById('expenseForm');

    // Open modal for new expense
    addNewExpenseBtn.addEventListener('click', () => {
        openExpenseModal();
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        closeExpenseModal();
    });

    cancelBtn.addEventListener('click', () => {
        closeExpenseModal();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeExpenseModal();
        }
    });

    // Handle form submission
    expenseForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        await handleExpenseSubmit();
    });
}

function openExpenseModal(expense = null) {
    const modal = document.getElementById('expenseModal');
    const modalTitle = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveExpenseBtn');

    if (expense) {
        // Edit mode
        modalTitle.textContent = 'Edit Expense';
        saveBtn.textContent = 'Update Expense';
        editingExpenseId = expense.id;

        // Populate form with expense data
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseCategory').value = getCategoryId(expense.category);
        document.getElementById('expenseDescription').value = expense.description || '';
        document.getElementById('expenseDate').value = expense.date;
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Expense';
        saveBtn.textContent = 'Save Expense';
        editingExpenseId = null;

        // Reset form
        document.getElementById('expenseForm').reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expenseDate').value = today;
    }

    modal.style.display = 'block';
}

function closeExpenseModal() {
    document.getElementById('expenseModal').style.display = 'none';
    document.getElementById('expenseForm').reset();
    editingExpenseId = null;
}

async function handleExpenseSubmit() {
    const expenseData = {
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category_id: parseInt(document.getElementById('expenseCategory').value),
        description: document.getElementById('expenseDescription').value,
        date: document.getElementById('expenseDate').value
    };

    try {
        if (editingExpenseId) {
            // Update existing expense
            await ApiService.updateExpense(editingExpenseId, expenseData);
            showMessage('Expense updated successfully!', 'success');
        } else {
            // Add new expense
            await ApiService.addExpense(expenseData);
            showMessage('Expense added successfully!', 'success');
        }

        closeExpenseModal();
        loadExpenses(); // Reload expenses list

    } catch (error) {
        console.error('Error saving expense:', error);
        showMessage('Error saving expense. Please try again.', 'error');
    }
}

async function editExpense(expenseId) {
    const expense = allExpenses.find(exp => exp.id === expenseId);
    if (expense) {
        openExpenseModal(expense);
    }
}

async function deleteExpense(expenseId) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    try {
        await ApiService.deleteExpense(expenseId);
        showMessage('Expense deleted successfully!', 'success');
        loadExpenses(); // Reload expenses list
    } catch (error) {
        console.error('Error deleting expense:', error);
        showMessage('Error deleting expense. Please try again.', 'error');
    }
}

function setupFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const monthFilter = document.getElementById('monthFilter');

    categoryFilter.addEventListener('change', applyFilters);
    monthFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const monthFilter = document.getElementById('monthFilter').value;

    filteredExpenses = allExpenses.filter(expense => {
        const matchesCategory = !categoryFilter || expense.category === categoryFilter;
        const matchesMonth = !monthFilter || expense.date.startsWith(monthFilter);
        return matchesCategory && matchesMonth;
    });

    displayExpenses(filteredExpenses);
    updateExpenseStats(filteredExpenses);
    renderDailyExpensesChart(filteredExpenses);
}

let dailyExpensesChartInstance = null;

function renderDailyExpensesChart(expenses) {
    const ctx = document.getElementById('dailyExpensesChart').getContext('2d');

    // Group expenses by date
    const expensesByDate = {};
    expenses.forEach(expense => {
        const date = expense.date;
        if (!expensesByDate[date]) {
            expensesByDate[date] = 0;
        }
        expensesByDate[date] += parseFloat(expense.amount);
    });

    // Sort dates
    const sortedDates = Object.keys(expensesByDate).sort();
    const data = sortedDates.map(date => expensesByDate[date]);

    // Format dates for labels
    const labels = sortedDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    });

    // Destroy existing chart if it exists
    if (dailyExpensesChartInstance) {
        dailyExpensesChartInstance.destroy();
    }

    dailyExpensesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Spending',
                data: data,
                backgroundColor: '#3182ce',
                borderRadius: 4,
                barThickness: 'flex',
                maxBarThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += '₹' + context.parsed.y.toLocaleString('en-IN', { minimumFractionDigits: 2 });
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function (value) {
                            return '₹' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function getCategoryColor(categoryName) {
    const colors = {
        'Food & Dining': '#FF6384',
        'Transportation': '#36A2EB',
        'Shopping': '#FFCE56',
        'Entertainment': '#4BC0C0',
        'Bills & Utilities': '#9966FF',
        'Healthcare': '#FF9F40',
        'Others': '#C9CBCF'
    };
    return colors[categoryName] || '#C9CBCF';
}

function getCategoryId(categoryName) {
    const categoryMap = {
        'Food & Dining': 1,
        'Transportation': 2,
        'Shopping': 3,
        'Entertainment': 4,
        'Bills & Utilities': 5,
        'Healthcare': 6,
        'Others': 7
    };
    return categoryMap[categoryName] || 7;
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
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
    messageDiv.style.minWidth = '200px';
    messageDiv.style.padding = '15px';
    messageDiv.style.borderRadius = '8px';

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        if (document.body.contains(messageDiv)) {
            document.body.removeChild(messageDiv);
        }
    }, 3000);
}
