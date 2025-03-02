const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const auth = require('../middleware/auth');

// Get all announcements
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .sort({ date: -1 })
            .populate('postedBy', 'firstName lastName');
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new announcement (faculty only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'faculty') {
            return res.status(403).json({ message: 'Only faculty can create announcements' });
        }

        const announcement = new Announcement({
            title: req.body.title,
            content: req.body.content,
            type: req.body.type,
            postedBy: req.user.id
        });

        const newAnnouncement = await announcement.save();
        await newAnnouncement.populate('postedBy', 'firstName lastName');
        res.status(201).json(newAnnouncement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete announcement (faculty only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'faculty') {
            return res.status(403).json({ message: 'Only faculty can delete announcements' });
        }

        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        await announcement.remove();
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 