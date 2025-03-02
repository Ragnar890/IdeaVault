const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Artificial Intelligence', 'Web Development', 'Mobile Development', 
               'IoT Projects', 'Blockchain', 'Cloud Computing']
    },
    technologies: [{
        type: String,
        required: true
    }],
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    githubUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'revision'],
        default: 'pending'
    },
    feedback: {
        type: String
    },
    submissionDate: {
        type: Date,
        default: Date.now
    },
    files: [{
        filename: String,
        path: String,
        uploadDate: Date
    }]
});

module.exports = mongoose.model('Project', projectSchema); 