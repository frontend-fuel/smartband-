document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const goSignup = document.getElementById('goSignup');
    const goLogin = document.getElementById('goLogin');

    function showForm(which) {
        if (!loginForm || !signupForm) return;
        const toLogin = which === 'login';
        loginForm.classList.toggle('active', toLogin);
        signupForm.classList.toggle('active', !toLogin);
        if (loginBtn) loginBtn.classList.toggle('active', toLogin);
        if (signupBtn) signupBtn.classList.toggle('active', !toLogin);
    }

    // Toggle between login and signup forms (buttons if present)
    if (loginBtn) {
        loginBtn.addEventListener('click', () => showForm('login'));
    }
    if (signupBtn) {
        signupBtn.addEventListener('click', () => showForm('signup'));
    }

    // Toggle via text links under forms
    if (goSignup) {
        goSignup.addEventListener('click', (e) => {
            e.preventDefault();
            showForm('signup');
        });
    }
    if (goLogin) {
        goLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showForm('login');
        });
    }

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login');
        }
    });

    // Handle signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;
        const fullName = signupForm.querySelector('input[type="text"]').value;
        const confirmPassword = signupForm.querySelectorAll('input[type="password"]')[1].value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, fullName })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Signup successful! Please login.');
                showForm('login'); // Switch to login form
                signupForm.reset();
            } else {
                alert(data.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during signup');
        }
    });
});