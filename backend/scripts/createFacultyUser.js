const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

require('dotenv').config();

async function createFacultyUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projecthub');
        console.log('Connected to MongoDB');

        // Check if faculty user already exists
        const existingUser = await User.findOne({ email: 'faculty@example.com' });
        if (existingUser) {
            console.log('Faculty user already exists');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Create faculty user
        const facultyUser = new User({
            firstName: 'Faculty',
            lastName: 'User',
            email: 'faculty@example.com',
            password: hashedPassword,
            role: 'faculty',
            department: 'Computer Science'
        });

        await facultyUser.save();
        console.log('Faculty user created successfully');
    } catch (error) {
        console.error('Error creating faculty user:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createFacultyUser();