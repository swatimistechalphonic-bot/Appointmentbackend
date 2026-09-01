require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 5008;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment_chat_db';

app.use(cors());
app.use(express.json());

// ── Connect DB ───────────────────────────────────────────────────────────────
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Chat Service connected to MongoDB'))
  .catch((err) => console.error('❌ Chat Service DB Connection Error:', err.message));

// ── Message Schema ────────────────────────────────────────────────────────────
const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  senderName: { type: String, default: '' },
  message: { type: String, required: true },
  room: { type: String, required: true },
  read: { type: Boolean, default: false },
  organizationId: { type: String, default: null }
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'Chat Service',
    status: 'UP',
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// ── Socket.io Setup ───────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`💬 Socket client connected: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, senderName, message, room, organizationId } = data;
      const savedMsg = await Message.create({
        senderId,
        receiverId,
        senderName: senderName || 'User',
        message,
        room,
        organizationId: organizationId || null
      });

      io.to(room).emit('receive_message', savedMsg);
    } catch (err) {
      console.error('Socket message save error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`💬 Socket client disconnected: ${socket.id}`);
  });
});

// ── REST Routes ───────────────────────────────────────────────────────────────
app.get('/api/chat/messages', async (req, res) => {
  try {
    const { room, senderId, receiverId } = req.query;
    const filter = {};
    if (room) filter.room = room;
    if (senderId && receiverId) {
      filter.$or = [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ];
    }

    const messages = await Message.find(filter).sort({ createdAt: 1 });
    res.json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 Chat Service running independently on port ${PORT}`);
  });
}

module.exports = app;
