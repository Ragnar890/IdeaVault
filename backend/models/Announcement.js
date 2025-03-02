const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['important', 'info', 'notice'],
        default: 'info'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Announcement', announcementSchema); 