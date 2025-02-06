require('dotenv').config();
const mongoose = require('mongoose');

async function checkConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
        
        // Get collection stats
        const users = await mongoose.connection.db.collection('users').countDocuments();
        const projects = await mongoose.connection.db.collection('projects').countDocuments();
        
        console.log(`Total Users: ${users}`);
        console.log(`Total Projects: ${projects}`);
        
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
    } finally {
        mongoose.disconnect();
    }
}

checkConnection(); 