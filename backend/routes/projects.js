const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// Get all projects
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('submittedBy', 'firstName lastName enrollmentNumber')
            .sort({ submissionDate: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get projects by student ID
router.get('/student/:studentId', auth, async (req, res) => {
    try {
        const projects = await Project.find({ submittedBy: req.params.studentId })
            .populate('submittedBy', 'firstName lastName enrollmentNumber')
            .sort({ submissionDate: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('submittedBy', 'firstName lastName enrollmentNumber');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Submit new project
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can submit projects' });
        }

        const project = new Project({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            technologies: req.body.technologies,
            submittedBy: req.user.id,
            githubUrl: req.body.githubUrl,
            files: req.body.files
        });

        const newProject = await project.save();
        await newProject.populate('submittedBy', 'firstName lastName enrollmentNumber');
        res.status(201).json(newProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update project (for feedback and status)
router.patch('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Only faculty can update status and feedback
        if (req.user.role === 'faculty') {
            if (req.body.status) project.status = req.body.status;
            if (req.body.feedback) project.feedback = req.body.feedback;
        } 
        // Students can only update their own projects
        else if (req.user.role === 'student' && project.submittedBy.toString() === req.user.id) {
            if (req.body.title) project.title = req.body.title;
            if (req.body.description) project.description = req.body.description;
            if (req.body.category) project.category = req.body.category;
            if (req.body.technologies) project.technologies = req.body.technologies;
            if (req.body.githubUrl) project.githubUrl = req.body.githubUrl;
            if (req.body.files) project.files = req.body.files;
        } else {
            return res.status(403).json({ message: 'Not authorized to update this project' });
        }

        const updatedProject = await project.save();
        await updatedProject.populate('submittedBy', 'firstName lastName enrollmentNumber');
        res.json(updatedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Only allow deletion by the student who submitted it or faculty
        if (req.user.role !== 'faculty' && project.submittedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this project' });
        }

        await project.remove();
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;