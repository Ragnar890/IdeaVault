const API_BASE_URL = 'http://localhost:30001';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const userType = sessionStorage.getItem('userType');
        const token = sessionStorage.getItem('token');
        const userId = sessionStorage.getItem('userId');
        
        console.log('Auth check:', { 
            isLoggedIn, 
            userType, 
            hasToken: !!token, 
            userId
        });
        
        if (!isLoggedIn || userType !== 'student' || !token || !userId) {
            window.location.href = '../login/login.html';
            return;
        }

        // Display student info
        const studentName = sessionStorage.getItem('userName');
        document.getElementById('studentName').textContent = studentName || 'Student';
        document.getElementById('enrollmentNumber').textContent = `ID: ${userId}`;

        // Initialize modals
        const submissionModal = new bootstrap.Modal(document.getElementById('submissionModal'));
        const projectSubmissionForm = document.getElementById('projectSubmissionForm');
        projectSubmissionForm.addEventListener('submit', handleProjectSubmission);

        // Load initial data
        await loadSubmissions();
        
        // Show initial view based on navigation
        const currentView = sessionStorage.getItem('currentView') || 'projects';
        if (currentView === 'progress') {
            showProgress();
        } else {
            showProjects();
        }
    } catch (error) {
        console.error('Error in DOMContentLoaded:', error);
        showNotification('Failed to initialize dashboard', 'error');
    }
});

// New function to initialize dashboard
function initializeDashboard() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        console.error('Main content section not found');
        return;
    }

    // Clear existing content
    mainContent.innerHTML = '';

    // Create projects section
    const projectsSection = document.createElement('section');
    projectsSection.id = 'projectsSection';
    projectsSection.className = 'section projects-section';
    projectsSection.innerHTML = `
        <div class="container py-4">
            <h2>My Projects</h2>
            <div class="category-buttons mb-4">
                <button class="btn btn-outline-primary" onclick="showSubmissionForm('Web')">Web Project</button>
                <button class="btn btn-outline-primary" onclick="showSubmissionForm('Mobile')">Mobile Project</button>
                <button class="btn btn-outline-primary" onclick="showSubmissionForm('AI')">AI Project</button>
                <button class="btn btn-outline-primary" onclick="showSubmissionForm('IoT')">IoT Project</button>
                <button class="btn btn-outline-primary" onclick="showSubmissionForm('Other')">Other Project</button>
            </div>
            <div id="submissionsList" class="submissions-list">
                <!-- Projects will be loaded here -->
            </div>
        </div>
    `;
    mainContent.appendChild(projectsSection);

    // Create progress section
    const progressSection = document.createElement('section');
    progressSection.id = 'progressSection';
    progressSection.className = 'section progress-section';
    progressSection.style.display = 'none';
    mainContent.appendChild(progressSection);

    // Load initial data
    loadSubmissions();
    loadProgress();
}

// Update showProjects function
function showProjects() {
    console.log('Showing projects section');
    
    const projectsSection = document.getElementById('projectsSection');
    const progressSection = document.getElementById('progressSection');
    
    if (!projectsSection || !progressSection) {
        console.error('Required sections not found');
        return;
    }
    
    projectsSection.style.display = 'block';
    progressSection.style.display = 'none';
    
    loadSubmissions();
    sessionStorage.setItem('currentView', 'projects');
}

// Update showProgress function
function showProgress() {
    console.log('Showing progress section');
    
    const projectsSection = document.getElementById('projectsSection');
    const progressSection = document.getElementById('progressSection');
    
    if (!projectsSection || !progressSection) {
        console.error('Required sections not found');
        return;
    }
    
    projectsSection.style.display = 'none';
    progressSection.style.display = 'block';
    
    loadProgress();
    sessionStorage.setItem('currentView', 'progress');
}

function showSubmissionForm(category) {
    // Map the display categories to the backend categories
    const categoryMap = {
        'AI': 'Artificial Intelligence',
        'Web': 'Web Development',
        'Mobile': 'Mobile Development',
        'IoT': 'IoT Projects',
        'Blockchain': 'Blockchain',
        'Other': 'Other Projects'
    };

    const mappedCategory = categoryMap[category] || category;
    document.getElementById('projectCategory').value = mappedCategory;
    const modalTitle = document.querySelector('.modal-title');
    modalTitle.textContent = `Submit ${category} Project`;
    
    const modal = new bootstrap.Modal(document.getElementById('submissionModal'));
    modal.show();
}

async function handleProjectSubmission(e) {
    e.preventDefault();

    const projectData = {
        title: document.getElementById('projectTitle').value.trim(),
        description: document.getElementById('projectDescription').value.trim(),
        category: document.getElementById('projectCategory').value,
        technologies: document.getElementById('projectTech').value.split(',').map(tech => tech.trim()),
        githubUrl: document.getElementById('projectUrl').value.trim(),
        teamMembers: document.getElementById('teamMembers').value.split(',').map(member => member.trim())
    };

    // Handle file uploads if any
    const fileInput = document.getElementById('projectFiles');
    if (fileInput.files.length > 0) {
        const formData = new FormData();
        for (let file of fileInput.files) {
            formData.append('files', file);
        }
        
        try {
            const uploadResponse = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: formData
            });
            
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload files');
            }
            
            const uploadResult = await uploadResponse.json();
            projectData.files = uploadResult.files;
        } catch (error) {
            console.error('Error uploading files:', error);
            showNotification('Failed to upload files', 'error');
            return;
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify(projectData)
        });

        if (!response.ok) {
            throw new Error('Failed to submit project');
        }

        // Close modal and show success message
        const modal = bootstrap.Modal.getInstance(document.getElementById('submissionModal'));
        modal.hide();
        
        showNotification('Project submitted successfully!', 'success');
        e.target.reset();
        
        // Reload submissions and progress
        loadSubmissions();
        loadProgress();
    } catch (error) {
        console.error('Error submitting project:', error);
        showNotification('Failed to submit project', 'error');
    }
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

async function loadSubmissions() {
    try {
        const userId = sessionStorage.getItem('userId');
        const token = sessionStorage.getItem('token');
        
        console.log('LoadSubmissions - Starting to load submissions:', {
            userId,
            hasToken: !!token
        });

        // Create submissions list if it doesn't exist
        let submissionsList = document.getElementById('submissionsList');
        if (!submissionsList) {
            console.log('Creating submissions list element');
            submissionsList = document.createElement('div');
            submissionsList.id = 'submissionsList';
            submissionsList.className = 'submissions-list';
            const projectsSection = document.getElementById('projectsSection');
            if (projectsSection) {
                projectsSection.appendChild(submissionsList);
            } else {
                console.error('Projects section not found');
                return;
            }
        }
        
        if (!userId || !token) {
            console.error('Missing user ID or token');
            submissionsList.innerHTML = '<p class="text-muted text-center py-4">Please log in again</p>';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/projects/student/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            submissionsList.innerHTML = '<p class="text-muted text-center py-4">Failed to load projects</p>';
            throw new Error(`Failed to load submissions: ${response.status} ${response.statusText}`);
        }

        const projects = await response.json();
        console.log('LoadSubmissions - Projects received:', projects);

        // Filter projects to only show current user's projects
        const userProjects = projects.filter(project => project.submittedBy._id === userId);
        console.log('LoadSubmissions - Filtered user projects:', userProjects);

        if (!userProjects || userProjects.length === 0) {
            submissionsList.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-muted">No projects submitted yet</p>
                    <button class="btn btn-primary mt-3" onclick="showSubmissionForm('Web')">
                        Submit Your First Project
                    </button>
                </div>
            `;
            return;
        }

        submissionsList.innerHTML = userProjects.map(project => `
            <div class="submission-card">
                <div class="submission-header">
                    <h4>${project.title}</h4>
                    <span class="status-badge ${getStatusClass(project.status)}">
                        ${project.status.toUpperCase()}
                    </span>
                </div>
                <div class="submission-details">
                    <p>${project.description}</p>
                    <div class="tech-stack">
                        ${project.technologies.map(tech => 
                            `<span class="tech-tag">${tech}</span>`
                        ).join('')}
                    </div>
                    <div class="submission-meta">
                        <span class="category-badge">
                            ${project.category}
                        </span>
                        <small class="text-muted">
                            Submitted on: ${new Date(project.submissionDate).toLocaleDateString()}
                        </small>
                    </div>
                    ${project.feedback ? `
                        <div class="feedback-section mt-3">
                            <h5>Faculty Feedback:</h5>
                            <p class="feedback-content">${project.feedback}</p>
                        </div>
                    ` : ''}
                    <div class="submission-actions mt-3">
                        ${project.githubUrl ? `
                            <a href="${project.githubUrl}" target="_blank" class="btn btn-sm btn-outline-primary">
                                <i class="fab fa-github"></i> View on GitHub
                            </a>
                        ` : ''}
                        ${project.files && project.files.length > 0 ? `
                            <a href="${API_BASE_URL}/uploads/${project.files[0].filename}" target="_blank" class="btn btn-sm btn-outline-info">
                                <i class="fas fa-file"></i> View Files
                            </a>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-info" onclick="editProject('${project._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteProject('${project._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error in loadSubmissions:', error);
        showNotification('Failed to load submissions: ' + error.message, 'error');
    }
}

async function editProject(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load project');
        }

        const project = await response.json();
        showEditProjectModal(project);
    } catch (error) {
        console.error('Error loading project:', error);
        showNotification('Failed to load project', 'error');
    }
}

function showEditProjectModal(project) {
    const modalHtml = `
        <div class="modal fade" id="editProjectModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Project</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editProjectForm">
                            <input type="hidden" id="projectId" value="${project._id}">
                            <div class="mb-3">
                                <label class="form-label">Project Title</label>
                                <input type="text" class="form-control" id="editProjectTitle" 
                                       value="${project.title}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" id="editProjectDescription" 
                                          rows="4" required>${project.description}</textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Category</label>
                                <select class="form-select" id="editProjectCategory" required>
                                    ${['Artificial Intelligence', 'Web Development', 'Mobile Development', 
                                       'IoT Projects', 'Blockchain', 'Cloud Computing']
                                        .map(cat => `
                                            <option value="${cat}" ${project.category === cat ? 'selected' : ''}>
                                                ${cat}
                                            </option>
                                        `).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Technologies</label>
                                <input type="text" class="form-control" id="editProjectTechnologies" 
                                       value="${project.technologies.join(', ')}" required>
                                <small class="text-muted">Separate technologies with commas</small>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">GitHub URL (Optional)</label>
                                <input type="url" class="form-control" id="editProjectGithub" 
                                       value="${project.githubUrl || ''}">
                            </div>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('editProjectModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
    modal.show();

    // Add form submit handler
    document.getElementById('editProjectForm').addEventListener('submit', handleEditProjectSubmit);
}

async function handleEditProjectSubmit(e) {
    e.preventDefault();
    
    const projectId = document.getElementById('projectId').value;
    const projectData = {
        title: document.getElementById('editProjectTitle').value.trim(),
        description: document.getElementById('editProjectDescription').value.trim(),
        category: document.getElementById('editProjectCategory').value,
        technologies: document.getElementById('editProjectTechnologies').value
            .split(',').map(tech => tech.trim()).filter(tech => tech),
        githubUrl: document.getElementById('editProjectGithub').value.trim()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify(projectData)
        });

        if (!response.ok) {
            throw new Error('Failed to update project');
        }

        bootstrap.Modal.getInstance(document.getElementById('editProjectModal')).hide();
        showNotification('Project updated successfully!', 'success');
        loadSubmissions();
        loadProgress();
    } catch (error) {
        console.error('Error updating project:', error);
        showNotification('Failed to update project', 'error');
    }
}

async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete project');
        }

        showNotification('Project deleted successfully!', 'success');
        loadSubmissions();
        loadProgress();
    } catch (error) {
        console.error('Error deleting project:', error);
        showNotification('Failed to delete project', 'error');
    }
}

async function loadProgress() {
    try {
        const userId = sessionStorage.getItem('userId');
        const token = sessionStorage.getItem('token');
        
        console.log('Loading progress for user:', userId); // Debug log
        
        if (!userId || !token) {
            throw new Error('Missing user ID or token');
        }

        const response = await fetch(`${API_BASE_URL}/api/projects/student/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Progress response status:', response.status); // Debug log

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText); // Debug log
            throw new Error(`Failed to load projects: ${response.status} ${response.statusText}`);
        }

        const allProjects = await response.json();
        // Filter projects to only show current user's projects
        const projects = allProjects.filter(project => project.submittedBy._id === userId);
        console.log('Loaded projects for progress:', projects); // Debug log
        
        const progressSection = document.getElementById('progressSection');
        if (!progressSection) {
            console.error('Progress section element not found'); // Debug log
            return;
        }

        // Calculate statistics
        const totalProjects = projects.length;
        const approvedProjects = projects.filter(p => p.status === 'approved').length;
        const pendingProjects = projects.filter(p => p.status === 'pending').length;
        const rejectedProjects = projects.filter(p => p.status === 'rejected').length;

        // Calculate category distribution
        const categoryDistribution = projects.reduce((acc, proj) => {
            acc[proj.category] = (acc[proj.category] || 0) + 1;
            return acc;
        }, {});

        // Update the progress section
        progressSection.innerHTML = `
            <div class="container py-4">
                <div class="row">
                    <div class="col-md-8">
                        <div class="card mb-4">
                            <div class="card-body">
                                <h4>Project Statistics</h4>
                                <div class="row text-center">
                                    <div class="col-md-3">
                                        <div class="stat-item">
                                            <h3>${totalProjects}</h3>
                                            <p>Total Projects</p>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="stat-item text-success">
                                            <h3>${approvedProjects}</h3>
                                            <p>Approved</p>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="stat-item text-warning">
                                            <h3>${pendingProjects}</h3>
                                            <p>Pending</p>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="stat-item text-danger">
                                            <h3>${rejectedProjects}</h3>
                                            <p>Needs Revision</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-body">
                                <h4>Recent Activity</h4>
                                ${projects.length > 0 ? `
                                    <div class="timeline">
                                        ${projects.slice(0, 5).map(project => `
                                            <div class="timeline-item">
                                                <div class="timeline-date">
                                                    ${new Date(project.submissionDate).toLocaleDateString()}
                                                </div>
                                                <div class="timeline-content">
                                                    <h5>${project.title}</h5>
                                                    <p class="mb-0">Status: 
                                                        <span class="badge ${getStatusClass(project.status)}">
                                                            ${project.status.toUpperCase()}
                                                        </span>
                                                    </p>
                                                    ${project.feedback ? `
                                                        <p class="mt-2 mb-0"><small>Feedback: ${project.feedback}</small></p>
                                                    ` : ''}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <p class="text-muted text-center py-3">No activity yet</p>
                                `}
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="card mb-4">
                            <div class="card-body">
                                <h4>Category Distribution</h4>
                                ${Object.keys(categoryDistribution).length > 0 ? `
                                    <div class="category-stats">
                                        ${Object.entries(categoryDistribution).map(([category, count]) => `
                                            <div class="category-stat-item">
                                                <span class="category-name">${category}</span>
                                                <div class="progress">
                                                    <div class="progress-bar" role="progressbar" 
                                                         style="width: ${(count/totalProjects*100)}%">
                                                        ${count}
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <p class="text-muted text-center py-3">No projects yet</p>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error in loadProgress:', error);
        showNotification('Failed to load progress: ' + error.message, 'error');
    }
}

// Helper function for status classes
function getStatusClass(status) {
    return {
        'pending': 'badge-warning',
        'approved': 'badge-success',
        'rejected': 'badge-danger',
        'revision': 'badge-info'
    }[status] || 'badge-secondary';
} 