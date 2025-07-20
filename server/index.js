import './middleware/passport.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import passport from 'passport';
import session from 'express-session';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/server/routes/uploads', express.static(path.join(__dirname, 'routes/uploads')));
app.use(session({ secret: process.env.SESSION_SECRET || 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// For production SPA fallback (add after all API routes)
// app.use(express.static(path.join(__dirname, '../client/dist')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/dist/index.html'));
// });

// MongoDB connection
// ✅ Clean, current way (Mongoose 6+)
mongoose
  .connect(process.env.MONGO_URI)   
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('sendMessage', (msg) => {
    socket.broadcast.emit('receiveMessage', msg);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 