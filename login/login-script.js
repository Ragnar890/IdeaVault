document.addEventListener('DOMContentLoaded', () => {
    const userTypeButtons = document.querySelectorAll('.user-type-toggle .btn');
    const studentFields = document.querySelector('.student-fields');
    const facultyFields = document.querySelector('.faculty-fields');
    const studentOnly = document.querySelector('.student-only');
    const loginForm = document.getElementById('loginForm');

    
    const facultyCredentials = {
        'FAC001': {
            name: 'Dr. Amit Patel',
            email: 'faculty.cse@paruluniversity.ac.in',
            password: 'faculty123',
            department: 'Computer Science'
        },
        'FAC002': {
            name: 'Prof. Priya Shah',
            email: 'faculty.it@paruluniversity.ac.in',
            password: 'faculty456',
            department: 'Information Technology'
        },
        'FAC003': {
            name: 'Dr. Rajesh Kumar',
            email: 'hod.cse@paruluniversity.ac.in',
            password: 'hod123',
            department: 'Computer Science'
        }
    };

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

    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userType = document.querySelector('.user-type-toggle .btn.active').dataset.type;
        const password = document.getElementById('password').value;

        if (userType === 'faculty') {
            const facultyId = document.getElementById('facultyId').value;
            const faculty = facultyCredentials[facultyId];

            if (faculty && faculty.password === password) {
                
                sessionStorage.setItem('userType', 'faculty');
                sessionStorage.setItem('facultyId', facultyId);
                sessionStorage.setItem('facultyName', faculty.name);
                sessionStorage.setItem('facultyEmail', faculty.email);
                sessionStorage.setItem('facultyDepartment', faculty.department);
                sessionStorage.setItem('isLoggedIn', 'true');

                showSuccess('Login successful! Redirecting to homepage...');
                setTimeout(() => {
                    window.location.href = '../home/index.html';
                }, 1500);
            } else {
                showError('Invalid faculty credentials');
            }
        } else {
            const enrollmentNumber = document.getElementById('enrollmentNumber').value;
            const students = JSON.parse(localStorage.getItem('students')) || [];
            const student = students.find(s => 
                s.enrollmentNumber === enrollmentNumber && 
                s.password === password
            );

            if (student) {
                // Store student info in session
                sessionStorage.setItem('userType', 'student');
                sessionStorage.setItem('studentId', student.enrollmentNumber);
                sessionStorage.setItem('studentName', `${student.firstName} ${student.lastName}`);
                sessionStorage.setItem('studentEmail', student.email);
                sessionStorage.setItem('isLoggedIn', 'true');

                showSuccess('Login successful! Redirecting to homepage...');
                setTimeout(() => {
                    window.location.href = '../home/index.html';
                }, 1500);
            } else {
                showError('Invalid student credentials');
            }
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