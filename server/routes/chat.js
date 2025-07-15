import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all messages
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find().populate('sender', 'username email');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Post a new message
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });
    const message = new Message({ sender: req.user.id, content });
    await message.save();
    const populatedMessage = await message.populate('sender', 'username email');
    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
