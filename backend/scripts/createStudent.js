const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createStudentUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projecthub');
        console.log('Connected to MongoDB');

        // Check if student user already exists
        const existingUser = await User.findOne({ email: 'student@test.com' });
        if (existingUser) {
            console.log('Student user already exists');
            process.exit(0);
        }

        // Generate unique enrollment number (Example: "STU" + Timestamp)
        const enrollmentNumber = `STU${Date.now()}`;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('student123', salt);

        // Create student user
        const studentUser = new User({
            firstName: 'Test',
            lastName: 'Student',
            email: 'student@test.com',
            password: hashedPassword,
            role: 'student',
            department: 'Computer Science',
            enrollmentNumber: enrollmentNumber // Ensure this is unique
        });

        await studentUser.save();
        console.log('Student user created successfully with enrollment number:', enrollmentNumber);
    } catch (error) {
        console.error('Error creating student user:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createStudentUser();