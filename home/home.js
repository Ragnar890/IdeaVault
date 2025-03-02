const API_BASE_URL = 'http://localhost:30001';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = '../login/login.html';
        return;
    }

    // Get user info
    const userType = sessionStorage.getItem('userType');
    const userName = userType === 'faculty' 
        ? sessionStorage.getItem('facultyName')
        : sessionStorage.getItem('studentName');
    
    // Update UI with user info
    document.getElementById('userName').textContent = userName;
    document.getElementById('userRole').textContent = userType.charAt(0).toUpperCase() + userType.slice(1);

    // Show/hide faculty-specific elements
    const facultyElements = document.querySelectorAll('.faculty-only');
    if (userType === 'faculty') {
        // Add faculty dashboard button and menu
        const userInfo = document.querySelector('.user-info').parentElement;
        userInfo.innerHTML = `
            <div class="user-info me-3 d-flex align-items-center">
                <img src="assets/user.png" alt="Profile" class="profile-image me-2">
                <div>
                    <span class="user-name" id="userName">${userName}</span>
                    <small class="d-block text-muted" id="userRole">Faculty</small>
                </div>
            </div>
            <button class="btn btn-outline-primary me-2" onclick="toggleDashboard()">
                <img src="assets/menu-burger.png" alt="Menu" class="menu-icon">
            </button>
            <button class="btn btn-outline-primary" onclick="logout()">Logout</button>
            
            <!-- Faculty Dashboard Menu -->
            <div class="faculty-dashboard-menu" id="facultyDashboard">
                <div class="dashboard-header">
                    <h5>Faculty Dashboard</h5>
                    <button class="btn-close" onclick="toggleDashboard()"></button>
                </div>
                <div class="dashboard-content">
                    <a href="#" onclick="showReviewPanel(); return false;">
                        <i class="fas fa-tasks"></i> Review Projects
                    </a>
                    <a href="#" onclick="showAnnouncementForm(); return false;">
                        <i class="fas fa-bullhorn"></i> Add Announcement
                    </a>
                    <a href="#" onclick="showStudentProgress(); return false;">
                        <i class="fas fa-chart-line"></i> Student Progress
                    </a>
                    <a href="#" onclick="showProjectAnalytics(); return false;">
                        <i class="fas fa-chart-pie"></i> Project Analytics
                    </a>
                    <a href="#" onclick="goToProjects(); return false;">
                        <i class="fas fa-project-diagram"></i> View Projects
                    </a>
                    <a href="#" onclick="showUploadForm(); return false;">
                        <i class="fas fa-upload"></i> Upload Project
                    </a>
                    <a href="#" onclick="showSettings(); return false;">
                        <i class="fas fa-cog"></i> Settings
                    </a>
                </div>
            </div>
        `;
        
        // Show faculty elements
        facultyElements.forEach(elem => {
            elem.style.display = 'block';
        });
    } else {
        // Add student dashboard button and menu
        const userInfo = document.querySelector('.user-info').parentElement;
        userInfo.innerHTML = `
            <div class="user-info me-3 d-flex align-items-center">
                <img src="assets/user.png" alt="Profile" class="profile-image me-2">
                <div>
                    <span class="user-name" id="userName">${userName}</span>
                    <small class="d-block text-muted" id="userRole">Student</small>
                </div>
            </div>
            <button class="btn btn-outline-primary me-2" onclick="toggleDashboard()">
                <img src="assets/menu-burger.png" alt="Menu" class="menu-icon">
            </button>
            <button class="btn btn-outline-primary" onclick="logout()">Logout</button>
            
            <!-- Student Dashboard Menu -->
            <div class="faculty-dashboard-menu" id="studentDashboard">
                <div class="dashboard-header">
                    <h5>Student Dashboard</h5>
                    <button class="btn-close" onclick="toggleDashboard()"></button>
                </div>
                <div class="dashboard-content">
                    <a href="#" onclick="showMyProjects(); return false;">
                        <i class="fas fa-folder"></i> My Projects
                    </a>
                    <a href="#" onclick="showUploadForm(); return false;">
                        <i class="fas fa-upload"></i> Submit New Project
                    </a>
                    <a href="#" onclick="showProjectList('all'); return false;">
                        <i class="fas fa-search"></i> Browse Projects
                    </a>
                    <a href="#" onclick="showProgress(); return false;">
                        <i class="fas fa-chart-line"></i> My Progress
                    </a>
                    <a href="#" onclick="showFeedback(); return false;">
                        <i class="fas fa-comments"></i> Project Feedback
                    </a>
                    <a href="#" onclick="showSettings(); return false;">
                        <i class="fas fa-cog"></i> Settings
                    </a>
                </div>
            </div>
        `;
        
        facultyElements.forEach(elem => {
            elem.style.display = 'none';
        });
    }

    // Load project categories
    loadProjectCategories();
    
    // Load statistics
    loadStatistics();
    
    // Load announcements
    loadAnnouncements();

    // Add event listener for project upload form
    document.body.addEventListener('submit', function(e) {
        if (e.target.id === 'projectUploadForm') {
            e.preventDefault();
            handleProjectUpload(e);
        }
    });
});

function loadProjectCategories() {
    const projectsContainer = document.querySelector('#projects .row');
    const categories = [
        {
            title: 'Artificial Intelligence',
            icon: 'fa-brain',
            color: '#3498DB',
            description: 'ML, Deep Learning, Neural Networks',
            examples: ['Machine Learning', 'Computer Vision', 'NLP']
        },
        {
            title: 'Web Development',
            icon: 'fa-globe',
            color: '#2ECC71',
            description: 'Frontend, Backend, Full Stack',
            examples: ['React', 'Node.js', 'Django']
        },
        {
            title: 'Mobile Development',
            icon: 'fa-mobile-alt',
            color: '#9B59B6',
            description: 'Android, iOS, Cross-platform',
            examples: ['Flutter', 'React Native', 'Native Apps']
        },
        {
            title: 'IoT Projects',
            icon: 'fa-microchip',
            color: '#F1C40F',
            description: 'IoT, Embedded Systems',
            examples: ['Arduino', 'Raspberry Pi', 'Sensors']
        },
        {
            title: 'Blockchain',
            icon: 'fa-link',
            color: '#E74C3C',
            description: 'Cryptocurrency, Smart Contracts',
            examples: ['DApps', 'Smart Contracts', 'Crypto']
        },
        {
            title: 'Cloud Computing',
            icon: 'fa-cloud',
            color: '#1ABC9C',
            description: 'AWS, Azure, Google Cloud',
            examples: ['Cloud Apps', 'Serverless', 'DevOps']
        }
    ];

    projectsContainer.innerHTML = categories.map(category => `
        <div class="col-md-4 mb-4">
            <div class="project-category-card" onclick="handleCategoryClick('${category.title}')" 
                 style="border-top: 4px solid ${category.color}">
                <div class="category-icon" style="color: ${category.color}">
                    <i class="fas ${category.icon}"></i>
                </div>
                <h3>${category.title}</h3>
                <p>${category.description}</p>
                <div class="category-examples">
                    ${category.examples.map(ex => `<span class="example-tag">${ex}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function loadStatistics() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    let totalProjects = 0;
    let approvedProjects = 0;
    let pendingProjects = 0;

    students.forEach(student => {
        if (student.submissions) {
            totalProjects += student.submissions.length;
            approvedProjects += student.submissions.filter(p => p.status === 'approved').length;
            pendingProjects += student.submissions.filter(p => p.status === 'pending').length;
        }
    });

    document.getElementById('totalProjects').textContent = totalProjects;
    document.getElementById('totalStudents').textContent = students.length;
    document.getElementById('approvedProjects').textContent = approvedProjects;
    document.getElementById('pendingProjects').textContent = pendingProjects;
}

async function loadAnnouncements() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/announcements`);
        const announcements = await response.json();
        
        const announcementsList = document.querySelector('.announcements-list');
        if (!announcements.length) {
            announcementsList.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-bullhorn fa-2x text-muted mb-3"></i>
                    <p class="text-muted">No announcements yet</p>
                </div>
            `;
            return;
        }

        announcementsList.innerHTML = announcements.map(announcement => `
            <div class="announcement-card ${announcement.type}">
                <div class="d-flex justify-content-between align-items-start">
                    <h4>${announcement.title}</h4>
                    ${sessionStorage.getItem('userType') === 'faculty' ? `
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteAnnouncement('${announcement._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
                <p>${announcement.content}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                        Posted by: ${announcement.postedBy.firstName} ${announcement.postedBy.lastName} on 
                        ${new Date(announcement.date).toLocaleDateString()}
                    </small>
                    <span class="badge bg-${getAnnouncementBadgeClass(announcement.type)}">${announcement.type}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading announcements:', error);
        showNotification('Failed to load announcements', 'error');
    }
}

function getAnnouncementBadgeClass(type) {
    const classes = {
        'important': 'danger',
        'info': 'info',
        'notice': 'warning'
    };
    return classes[type] || 'secondary';
}

async function deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete announcement');
        }

        loadAnnouncements();
        showNotification('Announcement deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting announcement:', error);
        showNotification('Failed to delete announcement', 'error');
    }
}

function showAnnouncementForm() {
    const modalHtml = `
        <div class="modal fade" id="announcementModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Announcement</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="announcementForm">
                            <div class="mb-3">
                                <label class="form-label">Title</label>
                                <input type="text" class="form-control" id="announcementTitle" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Content</label>
                                <textarea class="form-control" id="announcementContent" rows="4" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Type</label>
                                <select class="form-select" id="announcementType">
                                    <option value="important">Important</option>
                                    <option value="info">Information</option>
                                    <option value="notice">Notice</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary">Post Announcement</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('announcementModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('announcementModal'));
    modal.show();
    
    // Add event listener for form submission
    document.getElementById('announcementForm').addEventListener('submit', handleAnnouncementSubmit);
}

async function handleAnnouncementSubmit(e) {
    e.preventDefault();
    
    const announcement = {
        title: document.getElementById('announcementTitle').value.trim(),
        content: document.getElementById('announcementContent').value.trim(),
        type: document.getElementById('announcementType').value
    };

    try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/announcements`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(announcement)
        });

        if (!response.ok) {
            throw new Error('Failed to create announcement');
        }

        bootstrap.Modal.getInstance(document.getElementById('announcementModal')).hide();
        loadAnnouncements();
        showNotification('Announcement posted successfully!', 'success');
    } catch (error) {
        console.error('Error creating announcement:', error);
        showNotification('Failed to create announcement', 'error');
    }
}

function handleCategoryClick(category) {
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = '../login/login.html';
        return;
    }
    showUploadForm(category);
}

function showSubmissionForm(category) {
    window.location.href = '../student/dashboard.html#submit-' + category.toLowerCase();
}

function showProjectList(category = 'all') {
    // Hide other sections and show showcase
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('showcase').style.display = 'block';

    // Load and display projects
    loadShowcaseProjects(category);

    // Update showcase header with back button
    const showcaseHeader = document.querySelector('.showcase-header');
    showcaseHeader.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <button class="btn btn-outline-primary me-3" onclick="returnToHome()">
                    <i class="fas fa-arrow-left"></i> Back to Home
                </button>
                <h2 class="section-title d-inline-block mb-0">Project Showcase</h2>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center">
            <div class="filters">
                <button class="btn btn-outline-primary active" onclick="filterShowcase('all')">All</button>
                <button class="btn btn-outline-primary" onclick="filterShowcase('AI')">AI/ML</button>
                <button class="btn btn-outline-primary" onclick="filterShowcase('Web')">Web Dev</button>
                <button class="btn btn-outline-primary" onclick="filterShowcase('Mobile')">Mobile Apps</button>
                <button class="btn btn-outline-primary" onclick="filterShowcase('IoT')">IoT</button>
                <button class="btn btn-outline-primary" onclick="filterShowcase('Blockchain')">Blockchain</button>
            </div>
            <div class="search-box">
                <input type="text" class="form-control" placeholder="Search projects..." 
                       onkeyup="searchProjects(this.value)">
            </div>
        </div>
    `;

    // Update active filter button
    document.querySelectorAll('.filters .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.filters .btn[onclick*="${category}"]`).classList.add('active');
}

function returnToHome() {
    // Hide showcase section
    document.getElementById('showcase').style.display = 'none';
    
    // Show all other sections
    document.querySelectorAll('section').forEach(section => {
        if (section.id !== 'showcase' && section.id !== 'projectDetails') {
            section.style.display = 'block';
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showSettings() {
    const userType = sessionStorage.getItem('userType');
    if (userType === 'student') {
        window.location.href = '../student/dashboard.html#settings';
    } else {
        window.location.href = '../faculty/dashboard.html#settings';
    }
}

function showReviewPanel() {
    window.location.href = '../faculty/dashboard.html#reviews';
}

function goToProjects() {
    document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' });
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../login/login.html';
}

function showUploadForm(category = null) {
    // Close the dashboard menu if opened from dashboard
    if (!category) {
        toggleDashboard();
    }
    
    // Create and show the upload modal
    const modalHtml = `
        <div class="modal fade upload-modal" id="uploadModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Upload Project</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="projectUploadForm">
                            <div class="mb-3">
                                <label class="form-label">Project Title</label>
                                <input type="text" class="form-control" id="projectTitle" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" id="projectDescription" rows="4" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Project Category</label>
                                <div class="project-categories">
                                    ${[
                                        { title: 'Artificial Intelligence', icon: 'fa-brain', color: '#3498DB' },
                                        { title: 'Web Development', icon: 'fa-globe', color: '#2ECC71' },
                                        { title: 'Mobile Development', icon: 'fa-mobile-alt', color: '#9B59B6' },
                                        { title: 'IoT Projects', icon: 'fa-microchip', color: '#F1C40F' },
                                        { title: 'Blockchain', icon: 'fa-link', color: '#E74C3C' },
                                        { title: 'Cloud Computing', icon: 'fa-cloud', color: '#1ABC9C' }
                                    ].map(cat => `
                                        <div class="category-option ${category === cat.title ? 'active' : ''}" 
                                             onclick="selectCategory('${cat.title}')" 
                                             data-category="${cat.title}">
                                            <i class="fas ${cat.icon}" style="color: ${cat.color}"></i>
                                            <span>${cat.title}</span>
                                        </div>
                                    `).join('')}
                                </div>
                                <input type="hidden" id="projectCategory" name="category" value="${category || ''}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Technologies Used</label>
                                <div class="tech-input-container">
                                    <input type="text" class="form-control" id="techInput" 
                                           placeholder="Type to search technologies...">
                                    <div class="tech-suggestions" id="techSuggestions"></div>
                                </div>
                                <div class="selected-techs mt-2" id="selectedTechs"></div>
                                <small class="text-muted">Select a project category to see available technologies</small>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Project Files</label>
                                <div class="file-drop-zone" id="dropZone">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <p>Drag & Drop files here or click to browse</p>
                                    <input type="file" id="fileInput" multiple style="display: none;">
                                </div>
                                <div id="fileList" class="mt-3"></div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">GitHub Repository (Optional)</label>
                                <input type="url" class="form-control" id="githubUrl" 
                                       placeholder="https://github.com/username/repository">
                            </div>
                            <button type="submit" class="btn btn-primary">Submit Project</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('uploadModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Initialize modal
    const modal = new bootstrap.Modal(document.getElementById('uploadModal'));
    modal.show();

    // Setup file drop zone
    setupFileDropZone();

    // Initialize technology suggestions
    selectedTechnologies = new Set();
    document.getElementById('selectedTechs').innerHTML = '';
    
    // Add event listeners for tech input
    const techInput = document.getElementById('techInput');
    
    techInput.addEventListener('input', function() {
        const query = this.value.trim();
        showTechSuggestions(query);
    });
    
    techInput.addEventListener('focus', function() {
        const category = document.getElementById('projectCategory').value;
        if (category) {
            const query = this.value.trim();
            showTechSuggestions(query);
        }
    });
    
    techInput.addEventListener('blur', function() {
        // Small delay to allow clicking on suggestions
        setTimeout(() => {
            document.getElementById('techSuggestions').style.display = 'none';
        }, 200);
    });

    // If category is provided, initialize tech suggestions for that category
    if (category) {
        selectCategory(category);
    }

    // Add click event listener to close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        const techContainer = document.querySelector('.tech-input-container');
        if (techContainer && !techContainer.contains(e.target)) {
            document.getElementById('techSuggestions').style.display = 'none';
        }
    });
}

function setupFileDropZone() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#3498DB';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#ddd';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ddd';
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });

    function handleFiles(files) {
        fileList.innerHTML = Array.from(files).map(file => `
            <div class="alert alert-info">
                <i class="fas fa-file me-2"></i>
                ${file.name} (${(file.size / 1024).toFixed(2)} KB)
            </div>
        `).join('');
    }
}

async function handleProjectUpload(e) {
    e.preventDefault();
    
    const projectData = {
        title: document.getElementById('projectTitle').value.trim(),
        description: document.getElementById('projectDescription').value.trim(),
        category: document.getElementById('projectCategory').value,
        technologies: Array.from(selectedTechnologies),
        githubUrl: document.getElementById('githubUrl').value.trim()
    };

    // Handle file uploads if any
    const fileInput = document.getElementById('fileInput');
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

        const result = await response.json();
        
        // Close modal and show success message
        bootstrap.Modal.getInstance(document.getElementById('uploadModal')).hide();
        showNotification('Project submitted successfully!', 'success');
        
        // Refresh project list if we're in the showcase view
        if (document.getElementById('showcase').style.display === 'block') {
            loadShowcaseProjects('all');
        }
    } catch (error) {
        console.error('Error submitting project:', error);
        showNotification('Failed to submit project', 'error');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

async function loadShowcaseProjects(category = 'all') {
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
        const showcaseContainer = document.getElementById('showcaseProjects');

        // Filter projects if category is specified
        const filteredProjects = category === 'all' 
            ? projects 
            : projects.filter(project => project.category === category);

        // Sort projects by submission date (newest first)
        filteredProjects.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));

        // Generate HTML for projects
        showcaseContainer.innerHTML = filteredProjects.map(project => `
            <div class="col-md-6 mb-4 project-item" data-category="${project.category}">
                <div class="project-card">
                    <span class="category-badge" style="background: ${getCategoryColor(project.category)}20; 
                          color: ${getCategoryColor(project.category)}">
                        ${project.category}
                    </span>
                    <span class="status-badge ${getStatusClass(project.status)}">
                        ${project.status.toUpperCase()}
                    </span>
                    <h4>${project.title}</h4>
                    <p class="text-muted mb-2">By ${project.submittedBy.firstName} ${project.submittedBy.lastName}</p>
                    <p>${project.description}</p>
                    <div class="tech-stack">
                        ${project.technologies.map(tech => 
                            `<span class="tech-tag">${tech}</span>`
                        ).join('')}
                    </div>
                    <div class="project-links">
                        ${project.githubUrl ? 
                            `<a href="${project.githubUrl}" target="_blank">
                                <i class="fab fa-github"></i> View on GitHub
                            </a>` : ''
                        }
                        <a href="#" onclick="showProjectDetails('${project._id}')">
                            <i class="fas fa-info-circle"></i> More Details
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
        showNotification('Failed to load projects', 'error');
    }
}

function getCategoryColor(category) {
    const colors = {
        'AI': '#3498DB',
        'Web': '#2ECC71',
        'Mobile': '#9B59B6',
        'IoT': '#F1C40F',
        'Blockchain': '#E74C3C',
        'Other': '#34495E'
    };
    return colors[category] || colors.Other;
}

function getStatusClass(status) {
    const classes = {
        'pending': 'bg-warning text-dark',
        'approved': 'bg-success text-white',
        'rejected': 'bg-danger text-white',
        'revision': 'bg-info text-white'
    };
    return classes[status] || classes.pending;
}

function searchProjects(query) {
    const projects = document.querySelectorAll('.project-item');
    query = query.toLowerCase();

    projects.forEach(project => {
        const text = project.textContent.toLowerCase();
        project.style.display = text.includes(query) ? 'block' : 'none';
    });
}

function filterShowcase(category) {
    // Update active button
    document.querySelectorAll('.filters .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load filtered projects
    loadShowcaseProjects(category);
}

async function showProjectDetails(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load project details');
        }

        const project = await response.json();

        // Hide other sections
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show project details section
        const detailsSection = document.getElementById('projectDetails') || createProjectDetailsSection();
        detailsSection.style.display = 'block';
        
        // Update navigation
        const navLinks = document.querySelector('#navbarNav .navbar-nav');
        const backButton = document.createElement('li');
        backButton.className = 'nav-item';
        backButton.innerHTML = `
            <a class="nav-link back-button" href="#" onclick="goBack(); return false;">
                <i class="fas fa-arrow-left"></i> Back to Projects
            </a>
        `;
        navLinks.insertBefore(backButton, navLinks.firstChild);
        
        detailsSection.innerHTML = `
            <div class="container">
                <div class="project-detail-card">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2>${project.title}</h2>
                        <span class="status-badge ${getStatusClass(project.status)}">
                            ${project.status.toUpperCase()}
                        </span>
                    </div>
                    <p class="text-muted">Submitted by ${project.submittedBy.firstName} ${project.submittedBy.lastName}</p>
                    <div class="category-badge mb-3" style="background: ${getCategoryColor(project.category)}20; 
                         color: ${getCategoryColor(project.category)}">
                        ${project.category}
                    </div>
                    <div class="project-content">
                        <h4>Description</h4>
                        <p>${project.description}</p>
                        <h4>Technologies Used</h4>
                        <div class="tech-stack mb-4">
                            ${project.technologies.map(tech => 
                                `<span class="tech-tag">${tech}</span>`
                            ).join('')}
                        </div>
                        ${project.githubUrl ? `
                            <a href="${project.githubUrl}" target="_blank" class="btn btn-primary">
                                <i class="fab fa-github"></i> View on GitHub
                            </a>
                        ` : ''}
                        ${project.feedback ? `
                            <div class="feedback-section mt-4">
                                <h4>Faculty Feedback</h4>
                                <div class="feedback-content">
                                    <p>${project.feedback}</p>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading project details:', error);
        showNotification('Failed to load project details', 'error');
    }
}

function createProjectDetailsSection() {
    const section = document.createElement('section');
    section.id = 'projectDetails';
    section.className = 'project-details-section';
    document.body.appendChild(section);
    return section;
}

function goBack() {
    // Remove back button from navigation
    const backButton = document.querySelector('#navbarNav .navbar-nav .nav-item:first-child');
    if (backButton && backButton.querySelector('.nav-link').textContent.includes('Back to Projects')) {
        backButton.remove();
    }
    
    // Hide project details
    document.getElementById('projectDetails').style.display = 'none';
    
    // Show showcase section
    document.getElementById('showcase').style.display = 'block';
}

// Add these new faculty dashboard functions
function toggleDashboard() {
    const userType = sessionStorage.getItem('userType');
    const dashboard = document.getElementById(userType === 'faculty' ? 'facultyDashboard' : 'studentDashboard');
    dashboard.classList.toggle('active');
}

function showStudentProgress() {
    // Implementation for student progress view
    alert('Student Progress feature coming soon!');
    toggleDashboard();
}

function showProjectAnalytics() {
    // Implementation for project analytics
    alert('Project Analytics feature coming soon!');
    toggleDashboard();
}

// Add function to handle category selection
function selectCategory(category) {
    // Remove active class from all categories
    document.querySelectorAll('.category-option').forEach(opt => {
        opt.classList.remove('active');
    });
    
    // Add active class to selected category
    const selectedOption = document.querySelector(`.category-option[data-category="${category}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    // Update hidden input
    document.getElementById('projectCategory').value = category;
    
    // Clear and reinitialize technology suggestions
    selectedTechnologies = new Set();
    document.getElementById('selectedTechs').innerHTML = '';
    document.getElementById('techInput').value = '';
    
    // Show all available technologies for the selected category
    const suggestionsDiv = document.getElementById('techSuggestions');
    const suggestions = techSuggestions[category] || [];
    
    if (suggestions.length > 0) {
        suggestionsDiv.innerHTML = suggestions
            .map(tech => `<div class="suggestion-item" onclick="addTechnology('${tech}')">${tech}</div>`)
            .join('');
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

// Technology suggestion system
const techSuggestions = {
    'Artificial Intelligence': ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'OpenCV', 'NLTK', 'Pandas', 'NumPy', 'Matplotlib', 'Jupyter'],
    'Web Development': ['React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'MongoDB', 'PostgreSQL', 'Redis', 'HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'Bootstrap', 'Tailwind'],
    'Mobile Development': ['React Native', 'Flutter', 'Kotlin', 'Swift', 'Java', 'Android SDK', 'iOS SDK', 'Firebase', 'SQLite', 'Xamarin'],
    'IoT Projects': ['Arduino', 'Raspberry Pi', 'ESP32', 'MQTT', 'Node-RED', 'Python', 'C++', 'Sensors', 'Actuators', 'ZigBee'],
    'Blockchain': ['Solidity', 'Web3.js', 'Ethereum', 'Smart Contracts', 'Truffle', 'Hardhat', 'MetaMask', 'IPFS', 'Chainlink', 'OpenZeppelin'],
    'Cloud Computing': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Prometheus', 'Grafana', 'Serverless']
};

let selectedTechnologies = new Set();

function initializeTechSuggestions() {
    const category = document.querySelector('select[name="category"]').value;
    updateTechnologySuggestions(category);
}

function updateTechnologySuggestions(category) {
    selectedTechnologies.clear();
    document.getElementById('selectedTechs').innerHTML = '';
    document.getElementById('techInput').value = '';
    showTechSuggestions('');
}

function showTechSuggestions(query) {
    const category = document.getElementById('projectCategory').value;
    if (!category) {
        document.getElementById('techSuggestions').style.display = 'none';
        return;
    }

    const suggestions = techSuggestions[category] || [];
    const filteredSuggestions = suggestions.filter(tech => 
        tech.toLowerCase().includes(query.toLowerCase()) &&
        !selectedTechnologies.has(tech)
    );

    const suggestionsDiv = document.getElementById('techSuggestions');
    
    if (filteredSuggestions.length > 0) {
        suggestionsDiv.innerHTML = filteredSuggestions
            .map(tech => `<div class="suggestion-item" onclick="addTechnology('${tech}')">${tech}</div>`)
            .join('');
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

function addTechnology(tech) {
    selectedTechnologies.add(tech);
    updateSelectedTechsDisplay();
    const techInput = document.getElementById('techInput');
    techInput.value = '';
    techInput.focus();
    
    // Show remaining suggestions
    const category = document.getElementById('projectCategory').value;
    const suggestions = techSuggestions[category] || [];
    const remainingSuggestions = suggestions.filter(t => !selectedTechnologies.has(t));
    
    const suggestionsDiv = document.getElementById('techSuggestions');
    if (remainingSuggestions.length > 0) {
        suggestionsDiv.innerHTML = remainingSuggestions
            .map(tech => `<div class="suggestion-item" onclick="addTechnology('${tech}')">${tech}</div>`)
            .join('');
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

function removeTechnology(tech) {
    selectedTechnologies.delete(tech);
    updateSelectedTechsDisplay();
    
    // Show the removed technology in suggestions
    const category = document.getElementById('projectCategory').value;
    const suggestions = techSuggestions[category] || [];
    const availableSuggestions = suggestions.filter(t => !selectedTechnologies.has(t));
    
    const suggestionsDiv = document.getElementById('techSuggestions');
    if (availableSuggestions.length > 0) {
        suggestionsDiv.innerHTML = availableSuggestions
            .map(t => `<div class="suggestion-item" onclick="addTechnology('${t}')">${t}</div>`)
            .join('');
        suggestionsDiv.style.display = 'block';
    }
}

function updateSelectedTechsDisplay() {
    const container = document.getElementById('selectedTechs');
    container.innerHTML = Array.from(selectedTechnologies)
        .map(tech => `
            <span class="tech-tag">
                ${tech}
                <i class="fas fa-times ms-1" onclick="removeTechnology('${tech}')"></i>
            </span>
        `).join('');
}

// Student Dashboard Functions
function showMyProjects() {
    // Close dashboard
    toggleDashboard();
    
    // Hide other sections and show showcase
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('showcase').style.display = 'block';

    // Update showcase header
    const showcaseHeader = document.querySelector('.showcase-header');
    showcaseHeader.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <button class="btn btn-outline-primary me-3" onclick="returnToHome()">
                    <i class="fas fa-arrow-left"></i> Back to Home
                </button>
                <h2 class="section-title d-inline-block mb-0">My Projects</h2>
            </div>
            <button class="btn btn-primary" onclick="showUploadForm()">
                <i class="fas fa-plus"></i> New Project
            </button>
        </div>
    `;

    // Load student's projects
    const studentId = sessionStorage.getItem('studentId');
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const student = students.find(s => s.enrollmentNumber === studentId);
    
    const showcaseContainer = document.getElementById('showcaseProjects');
    if (!student || !student.submissions || student.submissions.length === 0) {
        showcaseContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                <h3>No Projects Yet</h3>
                <p class="text-muted">Start by submitting your first project!</p>
                <button class="btn btn-primary mt-3" onclick="showUploadForm()">
                    <i class="fas fa-plus"></i> Submit Project
                </button>
            </div>
        `;
        return;
    }

    // Sort projects by submission date (newest first)
    const projects = [...student.submissions].sort((a, b) => 
        new Date(b.submissionDate) - new Date(a.submissionDate)
    );

    // Display projects
    showcaseContainer.innerHTML = projects.map(project => `
        <div class="col-md-6 mb-4">
            <div class="project-card">
                <span class="category-badge" style="background: ${getCategoryColor(project.category)}20; 
                      color: ${getCategoryColor(project.category)}">
                    ${project.category}
                </span>
                <span class="status-badge ${getStatusClass(project.status)}">
                    ${project.status.toUpperCase()}
                </span>
                <h4>${project.title}</h4>
                <p>${project.description}</p>
                <div class="tech-stack">
                    ${project.technologies.map(tech => 
                        `<span class="tech-tag">${tech}</span>`
                    ).join('')}
                </div>
                <div class="project-links">
                    ${project.githubUrl ? 
                        `<a href="${project.githubUrl}" target="_blank">
                            <i class="fab fa-github"></i> View on GitHub
                        </a>` : ''
                    }
                    <a href="#" onclick="showProjectDetails('${project.id}')">
                        <i class="fas fa-info-circle"></i> More Details
                    </a>
                    ${project.feedback ? 
                        `<a href="#" onclick="showFeedbackDetails('${project.id}')">
                            <i class="fas fa-comments"></i> View Feedback
                        </a>` : ''
                    }
                </div>
            </div>
        </div>
    `).join('');
}

function showProgress() {
    toggleDashboard();
    
    // Hide other sections
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Create and show progress section if it doesn't exist
    let progressSection = document.getElementById('progressSection');
    if (!progressSection) {
        progressSection = document.createElement('section');
        progressSection.id = 'progressSection';
        progressSection.className = 'progress-section';
        document.body.appendChild(progressSection);
    }
    progressSection.style.display = 'block';

    // Get student's projects
    const studentId = sessionStorage.getItem('studentId');
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const student = students.find(s => s.enrollmentNumber === studentId);
    const projects = student?.submissions || [];

    // Calculate statistics
    const totalProjects = projects.length;
    const approvedProjects = projects.filter(p => p.status === 'approved').length;
    const pendingProjects = projects.filter(p => p.status === 'pending').length;
    const rejectedProjects = projects.filter(p => p.status === 'rejected').length;

    // Display progress dashboard
    progressSection.innerHTML = `
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <button class="btn btn-outline-primary" onclick="returnToHome()">
                    <i class="fas fa-arrow-left"></i> Back to Home
                </button>
                <h2 class="section-title mb-0">My Progress</h2>
            </div>
            
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
                            ${projects.length > 0 ? `
                                <div class="category-stats">
                                    ${Object.entries(
                                        projects.reduce((acc, proj) => {
                                            acc[proj.category] = (acc[proj.category] || 0) + 1;
                                            return acc;
                                        }, {})
                                    ).map(([category, count]) => `
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
}

function showFeedback() {
    toggleDashboard();
    
    // Hide other sections and show showcase
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('showcase').style.display = 'block';

    // Get student's projects with feedback
    const studentId = sessionStorage.getItem('studentId');
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const student = students.find(s => s.enrollmentNumber === studentId);
    const projectsWithFeedback = student?.submissions?.filter(p => p.feedback) || [];

    // Update showcase header
    const showcaseHeader = document.querySelector('.showcase-header');
    showcaseHeader.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <button class="btn btn-outline-primary me-3" onclick="returnToHome()">
                    <i class="fas fa-arrow-left"></i> Back to Home
                </button>
                <h2 class="section-title d-inline-block mb-0">Project Feedback</h2>
            </div>
        </div>
    `;

    // Display feedback
    const showcaseContainer = document.getElementById('showcaseProjects');
    if (projectsWithFeedback.length === 0) {
        showcaseContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                <h3>No Feedback Yet</h3>
                <p class="text-muted">Your project feedback will appear here once reviewed.</p>
            </div>
        `;
        return;
    }

    showcaseContainer.innerHTML = projectsWithFeedback.map(project => `
        <div class="col-12 mb-4">
            <div class="project-card">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h4>${project.title}</h4>
                    <span class="status-badge ${getStatusClass(project.status)}">
                        ${project.status.toUpperCase()}
                    </span>
                </div>
                <div class="feedback-content">
                    <h5>Feedback:</h5>
                    <p>${project.feedback}</p>
                </div>
                <div class="mt-3">
                    <small class="text-muted">
                        Submitted on: ${new Date(project.submissionDate).toLocaleDateString()}
                    </small>
                </div>
            </div>
        </div>
    `).join('');
}

function showFeedbackDetails(projectId) {
    const studentId = sessionStorage.getItem('studentId');
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const student = students.find(s => s.enrollmentNumber === studentId);
    const project = student?.submissions?.find(p => p.id === projectId);

    if (!project || !project.feedback) return;

    const modalHtml = `
        <div class="modal fade" id="feedbackModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Project Feedback</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <h4>${project.title}</h4>
                        <span class="status-badge ${getStatusClass(project.status)} mb-3">
                            ${project.status.toUpperCase()}
                        </span>
                        <div class="feedback-content">
                            <h5>Feedback from Faculty:</h5>
                            <p>${project.feedback}</p>
                        </div>
                        <div class="mt-3">
                            <small class="text-muted">
                                Feedback received on: ${new Date(project.feedbackDate).toLocaleDateString()}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('feedbackModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
    modal.show();
} 