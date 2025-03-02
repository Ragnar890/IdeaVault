require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const testUsers = [
    {
        email: 'faculty.cse@paruluniversity.ac.in',
        password: 'faculty123',
        firstName: 'Faculty',
        lastName: 'CSE',
        role: 'faculty'
    },
    {
        email: 'test.student@paruluniversity.ac.in',
        password: 'student123',
        firstName: 'Test',
        lastName: 'Student',
        enrollmentNumber: 'EN2024001',
        role: 'student'
    }
];

async function createTestUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User ${userData.email} already exists`);
                continue;
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            // Create user
            const user = new User({
                ...userData,
                password: hashedPassword
            });

            await user.save();
            console.log(`Created user: ${userData.email}`);
        }

        console.log('Test users created successfully');
    } catch (error) {
        console.error('Error creating test users:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createTestUsers(); 