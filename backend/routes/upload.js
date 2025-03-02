const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Handle multiple file uploads
router.post('/', auth, upload.array('files', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadedFiles = req.files.map(file => ({
            filename: file.filename,
            path: file.path.replace(/\\/g, '/'), // Normalize path for Windows
            uploadDate: new Date()
        }));

        res.status(200).json({ files: uploadedFiles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;