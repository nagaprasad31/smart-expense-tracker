document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('index.html') || window.location.pathname.includes('register.html') || window.location.pathname === '/') {
        checkAuthStatus();
    }
});

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('errorMessage');

        if (!username || !password) {
            errorDiv.textContent = 'Please fill in all fields';
            errorDiv.style.display = 'block';
            return;
        }

        try {
            const result = await ApiService.login(username, password);

            if (result.message === 'Login successful') {
                sessionStorage.setItem('userId', result.user_id);
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('username', username);

                window.location.href = 'dashboard.html';
            } else {
                errorDiv.textContent = result.error || 'Login failed';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            errorDiv.textContent = 'Network error. Please try again.';
            errorDiv.style.display = 'block';
        }
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorDiv = document.getElementById('errorMessage');

        if (!username || !password || !confirmPassword) {
            errorDiv.textContent = 'Please fill in all fields';
            errorDiv.style.display = 'block';
            return;
        }

        if (username.length < 3) {
            errorDiv.textContent = 'Username must be at least 3 characters';
            errorDiv.style.display = 'block';
            return;
        }

        if (password.length < 6) {
            errorDiv.textContent = 'Password must be at least 6 characters';
            errorDiv.style.display = 'block';
            return;
        }

        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            errorDiv.style.display = 'block';
            return;
        }

        try {
            const result = await ApiService.register(username, password);

            if (result.message === 'User created successfully') {
                alert('Registration successful! Please login.');
                window.location.href = 'index.html';
            } else {
                errorDiv.textContent = result.error || 'Registration failed';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            errorDiv.textContent = 'Network error. Please try again.';
            errorDiv.style.display = 'block';
        }
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function () {
            try {
                await ApiService.logout();
                sessionStorage.clear();
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }
}

function checkAuthStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname;

    if (isLoggedIn === 'true' && (currentPage.includes('index.html') || currentPage.includes('register.html') || currentPage === '/')) {
        window.location.href = 'dashboard.html';
    } else if (isLoggedIn !== 'true' && (currentPage.includes('dashboard.html') || currentPage.includes('expenses.html'))) {
        window.location.href = 'index.html';
    }
}

function protectPage() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}
