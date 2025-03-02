const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    enrollmentNumber: { type: String, unique: true },
    phone: String,
    role: { type: String, enum: ['student', 'faculty'], default: 'student' },
    department: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema); 