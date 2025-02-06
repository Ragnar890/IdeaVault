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
    facultyElements.forEach(elem => {
        elem.style.display = userType === 'faculty' ? 'block' : 'none';
    });

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

function loadAnnouncements() {
    const announcements = [
        {
            title: 'Project Submission Deadline',
            content: 'Final project submissions are due by the end of this month.',
            date: '2024-01-15',
            type: 'important'
        },
        {
            title: 'New Project Category Added',
            content: 'Cloud Computing projects are now accepted for submission.',
            date: '2024-01-10',
            type: 'info'
        },
        {
            title: 'Faculty Review Schedule',
            content: 'Project reviews will be conducted every Friday.',
            date: '2024-01-05',
            type: 'notice'
        }
    ];

    const announcementsList = document.querySelector('.announcements-list');
    announcementsList.innerHTML = announcements.map(announcement => `
        <div class="announcement-card ${announcement.type}">
            <h4>${announcement.title}</h4>
            <p>${announcement.content}</p>
            <small class="text-muted">Posted on: ${new Date(announcement.date).toLocaleDateString()}</small>
        </div>
    `).join('');
}

function handleCategoryClick(category) {
    const userType = sessionStorage.getItem('userType');
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = '../login/login.html';
        return;
    }
    showUploadModal(category);
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

    // Update active filter button
    document.querySelectorAll('.filters .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.filters .btn[onclick*="${category}"]`).classList.add('active');
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

function showUploadModal(category) {
    const modalHtml = `
        <div class="modal upload-modal fade" id="uploadModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Upload ${category} Project</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="projectUploadForm">
                            <input type="hidden" id="projectCategory" value="${category}">
                            <div class="mb-3">
                                <label class="form-label">Project Title</label>
                                <input type="text" class="form-control" id="projectTitle" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Project Description</label>
                                <textarea class="form-control" id="projectDescription" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Technologies Used</label>
                                <input type="text" class="form-control" id="technologies" 
                                       placeholder="e.g., Python, TensorFlow, React">
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

function handleProjectUpload(e) {
    const form = e.target;
    const studentId = sessionStorage.getItem('studentId');
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const studentIndex = students.findIndex(s => s.enrollmentNumber === studentId);

    if (studentIndex === -1) return;

    const projectData = {
        id: Date.now().toString(),
        category: document.getElementById('projectCategory').value,
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        technologies: document.getElementById('technologies').value.split(',').map(tech => tech.trim()),
        githubUrl: document.getElementById('githubUrl').value,
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

    // Close modal and show success message
    const modal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
    modal.hide();
    
    showNotification('Project submitted successfully!', 'success');
    loadStatistics(); // Refresh statistics after new submission
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

function loadShowcaseProjects(category) {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const showcaseContainer = document.getElementById('showcaseProjects');
    let allProjects = [];

    // Collect all projects
    students.forEach(student => {
        if (student.submissions) {
            student.submissions.forEach(project => {
                allProjects.push({
                    ...project,
                    studentName: `${student.firstName} ${student.lastName}`,
                    enrollmentNumber: student.enrollmentNumber
                });
            });
        }
    });

    // Filter projects if category is specified
    if (category !== 'all') {
        allProjects = allProjects.filter(project => project.category === category);
    }

    // Sort projects by submission date (newest first)
    allProjects.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));

    // Generate HTML for projects
    showcaseContainer.innerHTML = allProjects.map(project => `
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
                <p class="text-muted mb-2">By ${project.studentName}</p>
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
                </div>
            </div>
        </div>
    `).join('');
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