const router = require('express').Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all projects
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('student', 'firstName lastName enrollmentNumber')
            .populate('reviewedBy', 'firstName lastName');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Submit new project
router.post('/', auth, async (req, res) => {
    try {
        const project = new Project({
            ...req.body,
            student: req.user.id
        });
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update project status (faculty only)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        if (req.user.role !== 'faculty') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status,
                feedback: req.body.feedback,
                reviewedBy: req.user.id
            },
            { new: true }
        );
        res.json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add this route for file uploads
router.post('/upload', auth, upload.array('files', 5), async (req, res) => {
    try {
        const files = req.files.map(file => ({
            filename: file.originalname,
            path: file.path,
            size: file.size
        }));
        res.json(files);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 