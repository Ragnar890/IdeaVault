document.addEventListener('DOMContentLoaded', () => {
    const userTypeButtons = document.querySelectorAll('.user-type-toggle .btn');
    const studentFields = document.querySelector('.student-fields');
    const registrationForm = document.getElementById('registrationForm');

    
    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            enrollmentNumber: document.getElementById('enrollmentNumber').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        if (validateForm(formData)) {
            console.log('Registration data:', formData);
            alert('Registration successful!');
            window.location.href = 'login.html';
        }
    });
});

function validateForm(data) {
    
    if (data.password !== data.confirmPassword) {
        alert('Passwords do not match!');
        return false;
    }

    
    if (data.password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return false;
    }

   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        alert('Please enter a valid email address!');
        return false;
    }

    
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(data.phone)) {
        alert('Please enter a valid 10-digit phone number!');
        return false;
    }

    return true;
} 