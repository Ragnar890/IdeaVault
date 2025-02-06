const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['AI', 'Web', 'Mobile', 'IoT', 'Blockchain', 'Other'],
        required: true 
    },
    technologies: [String],
    githubUrl: String,
    files: [{
        filename: String,
        path: String,
        size: Number
    }],
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'revision'],
        default: 'pending'
    },
    feedback: String,
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    submissionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema); 