import express from 'express';
import multer from 'multer';
import Message from '../models/Message.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'server/routes/uploads/'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

// Send message
router.post('/messages', auth, async (req, res) => {
  const { content, receiver, file } = req.body;
  try {
    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
      file,
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch messages with a user
router.get('/messages', auth, async (req, res) => {
  const { userId } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    }).sort('createdAt');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// File upload
router.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/server/routes/uploads/${req.file.filename}` });
});

export default router; 