const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function initializeDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Drop existing collections
        await mongoose.connection.db.dropCollection('users').catch(err => console.log('No users collection to drop'));
        console.log('Dropped existing collections');

        // Create faculty users
        const facultyUsers = [
            {
                firstName: 'Amit',
                lastName: 'Patel',
                email: 'faculty.cse@paruluniversity.ac.in',
                enrollmentNumber: 'FAC001',
                password: 'faculty123',
                role: 'faculty',
                department: 'Computer Science'
            },
            {
                firstName: 'Priya',
                lastName: 'Shah',
                email: 'faculty.it@paruluniversity.ac.in',
                enrollmentNumber: 'FAC002',
                password: 'faculty456',
                role: 'faculty',
                department: 'Information Technology'
            }
        ];

        // Create test student
        const testStudent = {
            firstName: 'Test',
            lastName: 'Student',
            email: 'test.student@paruluniversity.ac.in',
            enrollmentNumber: '220305100501',
            password: 'student123',
            role: 'student',
            department: 'Computer Science'
        };

        // Hash passwords and save users
        for (const faculty of facultyUsers) {
            const hashedPassword = await bcrypt.hash(faculty.password, 10);
            const newFaculty = new User({
                ...faculty,
                password: hashedPassword
            });
            await newFaculty.save();
            console.log(`Faculty ${faculty.firstName} ${faculty.lastName} created`);
        }

        // Create test student
        const hashedStudentPassword = await bcrypt.hash(testStudent.password, 10);
        const newStudent = new User({
            ...testStudent,
            password: hashedStudentPassword
        });
        await newStudent.save();
        console.log('Test student created');

        console.log('Database initialization completed');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

initializeDatabase(); 