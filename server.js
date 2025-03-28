const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS
app.use(cors());

// Serve static files from specific directories
app.use('/login', express.static(path.join(__dirname, 'login')));
app.use('/home', express.static(path.join(__dirname, 'home')));
app.use('/faculty', express.static(path.join(__dirname, 'faculty')));
app.use('/student', express.static(path.join(__dirname, 'student')));

// Handle all routes by serving index.html or returning 404
app.get('*', (req, res) => {
    const filePath = path.join(__dirname, req.path);

    // Check if the requested file exists
    if (req.path.endsWith('.html') && require('fs').existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.sendFile(path.join(__dirname, 'login', 'login.html'));
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Frontend server running at http://localhost:${PORT}`);
    console.log(`Login page: http://localhost:${PORT}/login/login.html`);
    console.log(`Home page: http://localhost:${PORT}/home/index.html`);
});