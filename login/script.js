
const sampleProjects = [
    {
        title: "E-commerce Website",
        description: "A full-stack e-commerce platform built with MERN stack",
        category: "Web Development",
        lastUpdated: "2024-03-20"
    },
    {
        title: "Machine Learning Model",
        description: "Image classification using TensorFlow",
        category: "AI/ML",
        lastUpdated: "2024-03-19"
    }
];

function createProjectCard(project) {
    return `
        <div class="col-md-4 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${project.title}</h5>
                    <p class="card-text">${project.description}</p>
                    <div class="project-meta">
                        <span class="badge bg-primary">${project.category}</span>
                        <small class="text-muted">Updated: ${project.lastUpdated}</small>
                    </div>
                    <a href="#" class="btn btn-outline-primary mt-2">View Details</a>
                </div>
            </div>
        </div>
    `;
}


document.addEventListener('DOMContentLoaded', () => {
    const projectGrid = document.getElementById('projectGrid');
    projectGrid.innerHTML = sampleProjects.map(project => createProjectCard(project)).join('');

    
    document.getElementById('addProjectBtn').addEventListener('click', () => {
        
        alert('Add Project form will open here');
    });

    
    const userType = sessionStorage.getItem('userType');
    const userEmail = sessionStorage.getItem('userEmail');

    if (!userType || !userEmail) {
        
        window.location.href = 'login.html';
        return;
    }

    
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.innerHTML = `
            <div class="alert alert-success">
                Welcome, ${userEmail} (${userType})
            </div>
        `;
    }
}); 