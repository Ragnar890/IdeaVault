require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createFacultyUser() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }
        
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
        
        const hashedPassword = await bcrypt.hash('faculty123', 10);
        
        const facultyUser = new User({
            firstName: 'Test',
            lastName: 'Faculty',
            email: 'faculty@test.com',
            password: hashedPassword,
            enrollmentNumber: 'FAC001',
            role: 'faculty',
            department: 'Computer Science'
        });

        await facultyUser.save();
        console.log('Faculty user created successfully');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createFacultyUser(); 