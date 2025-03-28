document.addEventListener('DOMContentLoaded', () => {
    const userTypeButtons = document.querySelectorAll('.user-type-toggle .btn');
    const studentFields = document.querySelector('.student-fields');
    const facultyFields = document.querySelector('.faculty-fields');
    const studentOnly = document.querySelector('.student-only');
    const loginForm = document.getElementById('loginForm');

    // Toggle between student and faculty login
    userTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            userTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            if (button.dataset.type === 'student') {
                studentFields.style.display = 'block';
                facultyFields.style.display = 'none';
                studentOnly.style.display = 'block';
            } else {
                studentFields.style.display = 'none';
                facultyFields.style.display = 'block';
                studentOnly.style.display = 'none';
            }
        });
    });

    const API_BASE_URL = 'http://localhost:30001';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Login form submitted');

        // Get active user type
        const activeButton = document.querySelector('.user-type-toggle .btn.active');
        if (!activeButton) {
            showError('Please select a user type (Student or Faculty)');
            return;
        }
        const userType = activeButton.dataset.type;

        // Get email based on user type
        const emailInput = userType === 'faculty' ? 
            document.getElementById('facultyEmail') : 
            document.getElementById('studentEmail');
        
        const passwordInput = document.getElementById('password');

        // Validate form fields
        if (!emailInput || !passwordInput) {
            showError('Required form fields are missing');
            console.error('Form fields not found:', { 
                emailInput: !!emailInput, 
                passwordInput: !!passwordInput 
            });
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validate input values
        if (!email || !password) {
            showError('Please fill in all required fields');
            return;
        }

        console.log('Attempting login with:', { userType, email });

        try {
            const apiUrl = `${API_BASE_URL}/api/auth/login`;
            console.log('Sending request to:', apiUrl);
            console.log('Request payload:', { email, password, userType });
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password, userType })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                // Store user info in session
                sessionStorage.setItem('userType', data.user.role);
                sessionStorage.setItem('userId', data.user.id);
                sessionStorage.setItem('userName', data.user.name);
                sessionStorage.setItem('userEmail', data.user.email);
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('isLoggedIn', 'true');

                showSuccess('Login successful! Redirecting to homepage...');
                console.log('Login successful, redirecting...');
                
                // Use window.location.origin to get the base URL
                const homeUrl = window.location.origin + '/home/index.html';
                console.log('Redirecting to:', homeUrl);
                
                setTimeout(() => {
                    window.location.href = homeUrl;
                }, 1500);
            } else {
                console.error('Login failed:', data.message);
                showError(data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Error connecting to server. Please try again.');
        }
    });

    function showError(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger mt-3';
        alertDiv.textContent = message;
        loginForm.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }

    function showSuccess(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success mt-3';
        alertDiv.textContent = message;
        loginForm.appendChild(alertDiv);
    }
});