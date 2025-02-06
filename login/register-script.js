document.addEventListener('DOMContentLoaded', () => {
    const userTypeButtons = document.querySelectorAll('.user-type-toggle .btn');
    const studentFields = document.querySelector('.student-fields');
    const facultyFields = document.querySelector('.faculty-fields');
    const registrationForm = document.getElementById('registrationForm');

    userTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            userTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            if (button.dataset.type === 'student') {
                studentFields.style.display = 'block';
                facultyFields.style.display = 'none';
            } else {
                studentFields.style.display = 'none';
                facultyFields.style.display = 'block';
            }
        });
    });

    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            enrollmentNumber: document.getElementById('enrollmentNumber').value,
            email: generateStudentEmail(document.getElementById('enrollmentNumber').value),
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            userType: 'student',
            projectDetails: {
                title: '',
                description: '',
                category: '',
                status: 'pending'
            },
            submissions: []
        };

        if (validateForm(formData)) {
            
            const students = JSON.parse(localStorage.getItem('students')) || [];
           
            if (students.some(student => student.enrollmentNumber === formData.enrollmentNumber)) {
                showError('Enrollment number already registered');
                return;
            }

            
            delete formData.confirmPassword;
            
            
            students.push(formData);
            
            localStorage.setItem('students', JSON.stringify(students));

            showSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    });

    function showError(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger mt-3';
        alertDiv.textContent = message;
        registrationForm.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }

    function showSuccess(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success mt-3';
        alertDiv.textContent = message;
        registrationForm.appendChild(alertDiv);
    }
});

function validateForm(data) {
    
    if (data.password !== data.confirmPassword) {
        showError('Passwords do not match!');
        return false;
    }

    if (data.password.length < 6) {
        showError('Password must be at least 6 characters long!');
        return false;
    }

    
    const enrollmentRegex = /^2203051005\d{3}$/;
    if (!enrollmentRegex.test(data.enrollmentNumber)) {
        showError('Invalid enrollment number format. Should be 22030510050XXX');
        return false;
    }

    
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(data.phone)) {
        showError('Please enter a valid 10-digit phone number!');
        return false;
    }

    return true;
}

function generateStudentEmail(enrollmentNumber) {
    return `student${enrollmentNumber}@paruluniversity.ac.in`;
}


function addExampleStudent() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    
    const exampleStudent = {
        firstName: "Test",
        lastName: "Student",
        enrollmentNumber: "220305100501",
        email: "student220305100501@paruluniversity.ac.in",
        phone: "9876543210",
        password: "student123",
        userType: 'student',
        projectDetails: { 
            title: '', 
            description: '', 
            category: '', 
            status: 'pending' 
        },
        submissions: []
    };

    if (!students.some(s => s.enrollmentNumber === exampleStudent.enrollmentNumber)) {
        students.push(exampleStudent);
        localStorage.setItem('students', JSON.stringify(students));
    }
}


addExampleStudent(); 