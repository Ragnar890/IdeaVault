const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    // Check if the request is for a specific HTML file
    if (req.path.endsWith('.html')) {
        res.sendFile(path.join(__dirname, req.path));
    } else {
        res.sendFile(path.join(__dirname, 'login', 'login.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Frontend server running at http://localhost:${PORT}`);
    console.log(`Login page: http://localhost:${PORT}/login/login.html`);
    console.log(`Home page: http://localhost:${PORT}/home/index.html`);
}); 