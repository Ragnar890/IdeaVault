require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');

async function createTestData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Create test student
        const hashedPassword = await bcrypt.hash('student123', 10);
        const student = new User({
            firstName: 'Test',
            lastName: 'Student',
            email: 'student@test.com',
            password: hashedPassword,
            enrollmentNumber: '220305100501',
            role: 'student',
            department: 'Computer Science'
        });

        const savedStudent = await student.save();

        // Create test project
        const project = new Project({
            title: 'Test Project',
            description: 'This is a test project',
            category: 'Web',
            technologies: ['React', 'Node.js', 'MongoDB'],
            student: savedStudent._id,
            status: 'pending',
            githubUrl: 'https://github.com/test/project'
        });

        await project.save();
        console.log('Test data created successfully');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
}

createTestData(); 