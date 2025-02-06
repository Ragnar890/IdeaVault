document.addEventListener('DOMContentLoaded', () => {
    // Check if faculty is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userType = sessionStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'faculty') {
        window.location.href = '../login/login.html';
        return;
    }

    // Display faculty name
    const facultyId = sessionStorage.getItem('facultyId');
    document.getElementById('facultyName').textContent = `Faculty ID: ${facultyId}`;

    // Load all projects initially
    loadProjects('all');

    // Setup feedback form handler
    document.getElementById('feedbackForm').addEventListener('submit', handleFeedbackSubmission);
});

function loadProjects(category) {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';

    students.forEach(student => {
        if (!student.submissions) return;

        student.submissions.forEach(project => {
            if (category === 'all' || project.category === category) {
                const projectCard = createProjectCard(student, project);
                projectsList.appendChild(projectCard);
            }
        });
    });
}

function createProjectCard(student, project) {
    const card = document.createElement('div');
    card.className = 'project-card mb-3';
    
    const statusClass = {
        'pending': 'text-warning',
        'approved': 'text-success',
        'rejected': 'text-danger',
        'revision': 'text-info'
    }[project.status];

    card.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${project.title}</h5>
                <h6 class="card-subtitle mb-2 text-muted">
                    ${student.firstName} ${student.lastName} (${student.enrollmentNumber})
                </h6>
                <p class="card-text">${project.description}</p>
                <p class="mb-2">
                    <strong>Category:</strong> ${project.category}
                    <br>
                    <strong>Status:</strong> <span class="${statusClass}">${project.status.toUpperCase()}</span>
                    <br>
                    <strong>Submitted:</strong> ${new Date(project.submissionDate).toLocaleDateString()}
                </p>
                ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="card-link">View Project</a>` : ''}
                <button class="btn btn-primary btn-sm" onclick="showFeedbackModal('${student.enrollmentNumber}', '${project.id}')">
                    Provide Feedback
                </button>
            </div>
        </div>
    `;

    return card;
}

function showFeedbackModal(studentId, projectId) {
    document.getElementById('studentId').value = studentId;
    document.getElementById('projectId').value = projectId;
    new bootstrap.Modal(document.getElementById('feedbackModal')).show();
}

function handleFeedbackSubmission(e) {
    e.preventDefault();

    const studentId = document.getElementById('studentId').value;
    const projectId = document.getElementById('projectId').value;
    const status = document.getElementById('projectStatus').value;
    const feedback = document.getElementById('feedbackText').value;

    const students = JSON.parse(localStorage.getItem('students')) || [];
    const studentIndex = students.findIndex(s => s.enrollmentNumber === studentId);

    if (studentIndex === -1) return;

    const projectIndex = students[studentIndex].submissions.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return;

    // Update project status and feedback
    students[studentIndex].submissions[projectIndex].status = status;
    students[studentIndex].submissions[projectIndex].feedback = feedback;

    // Save changes
    localStorage.setItem('students', JSON.stringify(students));

    // Close modal and reload projects
    bootstrap.Modal.getInstance(document.getElementById('feedbackModal')).hide();
    loadProjects('all');
    e.target.reset();
}

function filterProjects(category) {
    // Update active button
    document.querySelectorAll('.category-filter .list-group-item').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load filtered projects
    loadProjects(category);
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../login/login.html';
} 