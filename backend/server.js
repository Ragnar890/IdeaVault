require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Project = require('./models/Project');
const app = express();

// Import routes
const announcementRoutes = require('./routes/announcements');
const projectRoutes = require('./routes/projects');
const uploadRoutes = require('./routes/upload');
const auth = require('./middleware/auth');

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-vercel-domain.vercel.app', 'https://idea-vault.vercel.app']
        : ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:8081'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, password, userType } = req.body;
    console.log('Login attempt:', { email, userType });

    try {
        const user = await User.findOne({ 
            email: email,
            role: userType === 'faculty' ? 'faculty' : 'student'
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
            
            res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', projectRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/upload', uploadRoutes);

// API endpoints for student projects
app.get('/api/students/:studentId/projects', auth, async (req, res) => {
    try {
        const projects = await Project.find({ student: req.params.studentId });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Serve specific HTML files
app.get('/*.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', req.path));
});

// Serve home page for root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'home', 'index.html'));
});

// Handle all other routes
app.get('*', (req, res) => {
    const knownRoutes = ['/dashboard', '/projects', '/profile'];
    const route = knownRoutes.find(r => req.path.startsWith(r));
    
    if (route) {
        res.sendFile(path.join(__dirname, '..', 'home', 'index.html'));
    } else {
        res.redirect('/login/login.html');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Create initial users if they don't exist
const createInitialUsers = async () => {
    try {
        const studentCount = await User.countDocuments({ role: 'student' });
        const facultyCount = await User.countDocuments({ role: 'faculty' });
        
        if (studentCount === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            await User.create({
                firstName: 'John',
                lastName: 'Student',
                email: 'student@example.com',
                password: hashedPassword,
                enrollmentNumber: 'STU001',
                role: 'student',
                department: 'Computer Science'
            });
            console.log('Created initial student user');
        }
        
        if (facultyCount === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            await User.create({
                firstName: 'Dr',
                lastName: 'Smith',
                email: 'faculty@example.com',
                password: hashedPassword,
                enrollmentNumber: 'FAC001',
                role: 'faculty',
                department: 'Computer Science'
            });
            console.log('Created initial faculty user');
        }
    } catch (error) {
        console.error('Error creating initial users:', error);
    }
};

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 8081;
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`Login page: http://localhost:${PORT}/login/login.html`);
        console.log(`Home page: http://localhost:${PORT}/home/index.html`);
        createInitialUsers();
    });
}

// For Vercel
module.exports = app;