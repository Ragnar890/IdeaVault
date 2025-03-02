const API_BASE_URL = 'http://localhost:30001';

document.addEventListener('DOMContentLoaded', () => {
    // Check if faculty is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userType = sessionStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'faculty') {
        window.location.href = '../login/login.html';
        return;
    }

    // Display faculty name
    const facultyName = sessionStorage.getItem('facultyName');
    const facultyId = sessionStorage.getItem('userId');
    document.getElementById('facultyName').textContent = facultyName;

    // Load all projects initially
    loadProjects('all');

    // Setup feedback form handler
    document.getElementById('feedbackForm').addEventListener('submit', handleFeedbackSubmission);
});

async function loadProjects(category) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load projects');
        }

        const projects = await response.json();
        const projectsList = document.getElementById('projectsList');
        projectsList.innerHTML = '';

        // Filter projects if category is specified
        const filteredProjects = category === 'all' 
            ? projects 
            : projects.filter(project => project.category === category);

        if (filteredProjects.length === 0) {
            projectsList.innerHTML = '<p class="text-muted text-center">No projects found</p>';
            return;
        }

        filteredProjects.forEach(project => {
            const projectCard = createProjectCard(project);
            projectsList.appendChild(projectCard);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
        showNotification('Failed to load projects', 'error');
    }
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card mb-3';
    
    const statusClass = {
        'pending': 'text-warning',
        'approved': 'text-success',
        'rejected': 'text-danger',
        'revision': 'text-info'
    }[project.status];

    const submissionDate = new Date(project.submissionDate).toLocaleDateString();
    const studentName = project.studentName || 'Student'; // Fallback if name not available

    card.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${project.title}</h5>
                <h6 class="card-subtitle mb-2 text-muted">
                    ${studentName} (ID: ${project.studentId})
                </h6>
                <p class="card-text">${project.description}</p>
                <div class="project-details">
                    <p class="mb-2">
                        <strong>Category:</strong> ${project.category}
                        <br>
                        <strong>Status:</strong> <span class="${statusClass}">${project.status.toUpperCase()}</span>
                        <br>
                        <strong>Submitted:</strong> ${submissionDate}
                    </p>
                    <div class="tech-stack">
                        ${project.technologies.map(tech => 
                            `<span class="tech-tag">${tech}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="project-actions mt-3">
                    ${project.githubUrl ? 
                        `<a href="${project.githubUrl}" target="_blank" class="btn btn-sm btn-outline-primary">
                            <i class="fab fa-github"></i> View Project
                        </a>` : ''
                    }
                    ${project.files && project.files.length > 0 ? 
                        `<a href="${API_BASE_URL}/uploads/${project.files[0]}" target="_blank" class="btn btn-sm btn-outline-info">
                            <i class="fas fa-file"></i> View Files
                        </a>` : ''
                    }
                    <button class="btn btn-primary btn-sm" onclick="showFeedbackModal('${project._id}')">
                        <i class="fas fa-comment"></i> Provide Feedback
                    </button>
                </div>
                ${project.feedback ? `
                    <div class="feedback-section mt-3">
                        <h6>Previous Feedback:</h6>
                        <p class="feedback-content">${project.feedback}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    return card;
}

function showFeedbackModal(projectId) {
    document.getElementById('projectId').value = projectId;
    new bootstrap.Modal(document.getElementById('feedbackModal')).show();
}

async function handleFeedbackSubmission(e) {
    e.preventDefault();

    const projectId = document.getElementById('projectId').value;
    const status = document.getElementById('projectStatus').value;
    const feedback = document.getElementById('feedbackText').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({
                status,
                feedback
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update project');
        }

        // Close modal and reload projects
        bootstrap.Modal.getInstance(document.getElementById('feedbackModal')).hide();
        showNotification('Feedback submitted successfully!', 'success');
        loadProjects('all');
        e.target.reset();
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showNotification('Failed to submit feedback', 'error');
    }
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