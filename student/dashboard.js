document.addEventListener('DOMContentLoaded', () => {
    
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userType = sessionStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'student') {
        window.location.href = '../login/login.html';
        return;
    }

    
    const studentName = sessionStorage.getItem('studentName');
    const studentId = sessionStorage.getItem('studentId');
    
    document.getElementById('studentName').textContent = studentName;
    document.getElementById('enrollmentNumber').textContent = `ID: ${studentId}`;

   
    const submissionModal = new bootstrap.Modal(document.getElementById('submissionModal'));
    const projectSubmissionForm = document.getElementById('projectSubmissionForm');

    projectSubmissionForm.addEventListener('submit', handleProjectSubmission);
});

function showSubmissionForm(category) {
    document.getElementById('projectCategory').value = category;
    const modalTitle = document.querySelector('.modal-title');
    modalTitle.textContent = `Submit ${category} Project`;
    
    const modal = new bootstrap.Modal(document.getElementById('submissionModal'));
    modal.show();
}

function handleProjectSubmission(e) {
    e.preventDefault();

    const studentId = sessionStorage.getItem('studentId');
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const studentIndex = students.findIndex(s => s.enrollmentNumber === studentId);

    if (studentIndex === -1) return;

    const projectData = {
        id: Date.now().toString(),
        category: document.getElementById('projectCategory').value,
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        technologies: document.getElementById('projectTech').value.split(',').map(tech => tech.trim()),
        githubUrl: document.getElementById('projectUrl').value,
        teamMembers: document.getElementById('teamMembers').value.split(',').map(member => member.trim()),
        submissionDate: new Date().toISOString(),
        status: 'pending',
        feedback: ''
    };

    // Add project to student's submissions
    if (!students[studentIndex].submissions) {
        students[studentIndex].submissions = [];
    }
    students[studentIndex].submissions.push(projectData);

    // Update localStorage
    localStorage.setItem('students', JSON.stringify(students));

    // Show success message and close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('submissionModal'));
    modal.hide();
    
    showNotification('Project submitted successfully!', 'success');
    e.target.reset();
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../login/login.html';
}

function toggleSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    settingsPanel.classList.toggle('active');
    loadStudentData();
    loadSubmissions();
}

function loadStudentData() {
    const studentId = sessionStorage.getItem('studentId');
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const student = students.find(s => s.enrollmentNumber === studentId);

    if (student) {
        document.getElementById('settingsFirstName').value = student.firstName;
        document.getElementById('settingsLastName').value = student.lastName;
        document.getElementById('settingsPhone').value = student.phone;
    }
}

function loadSubmissions() {
    const studentId = sessionStorage.getItem('studentId');
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const student = students.find(s => s.enrollmentNumber === studentId);
    const submissionsList = document.getElementById('submissionsList');

    submissionsList.innerHTML = '';

    if (student && student.submissions) {
        student.submissions.forEach(submission => {
            const submissionElement = createSubmissionElement(submission);
            submissionsList.appendChild(submissionElement);
        });
    } else {
        submissionsList.innerHTML = '<p class="text-muted">No submissions yet</p>';
    }
}

function createSubmissionElement(submission) {
    const div = document.createElement('div');
    div.className = 'submission-item';
    
    const statusClass = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-rejected'
    }[submission.status];

    div.innerHTML = `
        <h5>${submission.title}</h5>
        <p class="mb-1"><small>Category: ${submission.category}</small></p>
        <p class="mb-1"><small>Submitted: ${new Date(submission.submissionDate).toLocaleDateString()}</small></p>
        <span class="submission-status ${statusClass}">${submission.status.toUpperCase()}</span>
        ${submission.feedback ? `<p class="mt-2 mb-0"><small>Feedback: ${submission.feedback}</small></p>` : ''}
    `;

    return div;
}

// Add event listeners for settings forms
document.getElementById('profileSettingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const studentId = sessionStorage.getItem('studentId');
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const studentIndex = students.findIndex(s => s.enrollmentNumber === studentId);

    if (studentIndex !== -1) {
        students[studentIndex].firstName = document.getElementById('settingsFirstName').value;
        students[studentIndex].lastName = document.getElementById('settingsLastName').value;
        students[studentIndex].phone = document.getElementById('settingsPhone').value;

        localStorage.setItem('students', JSON.stringify(students));
        sessionStorage.setItem('studentName', `${students[studentIndex].firstName} ${students[studentIndex].lastName}`);
        
        document.getElementById('studentName').textContent = `${students[studentIndex].firstName} ${students[studentIndex].lastName}`;
        showNotification('Profile updated successfully!');
    }
});

document.getElementById('passwordChangeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
        showNotification('New passwords do not match!', 'danger');
        return;
    }

    const studentId = sessionStorage.getItem('studentId');
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const studentIndex = students.findIndex(s => s.enrollmentNumber === studentId);

    if (studentIndex !== -1 && students[studentIndex].password === currentPassword) {
        students[studentIndex].password = newPassword;
        localStorage.setItem('students', JSON.stringify(students));
        showNotification('Password changed successfully!');
        e.target.reset();
    } else {
        showNotification('Current password is incorrect!', 'danger');
    }
});

// Close settings panel when clicking outside
document.addEventListener('click', function(e) {
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsButton = document.querySelector('.settings-button');
    
    if (!settingsPanel.contains(e.target) && !settingsButton.contains(e.target) && settingsPanel.classList.contains('active')) {
        settingsPanel.classList.remove('active');
    }
}); 