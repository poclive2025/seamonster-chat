const express = require('express');
const cors = require("cors");
const multer = require('multer');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());

const PORT = process.env.PORT || 3000;

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and HEIC images are allowed'));
    }
  }
});

// Serve static files (your public folder)
app.use(express.static('public'));

// In-memory chat history
const chatHistory = [];

// POST /chat to accept message + optional image
app.post('/chat', (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { username, message } = req.body;

    if (!username || !message) {
      return res.status(400).json({ error: "Username and message are required" });
    }

    let imageUrl = null;
    if (req.file) {
      // Convert image buffer to base64 and create a data URL for easy client display
      const base64 = req.file.buffer.toString('base64');
      const mime = req.file.mimetype;
      imageUrl = `data:${mime};base64,${base64}`;
    }

    const chatMessage = { username, message, imageUrl };

    // Save to chat history
    chatHistory.push(chatMessage);

    // Broadcast new message to all connected clients via Socket.IO
    io.emit('newMessage', chatMessage);

    console.log(`New message from ${username}: ${message}${imageUrl ? ' [with image]' : ''}`);

    // Respond immediately to POST request
    res.json({ response: 'Message sent' });
  });
});

// When a client connects, send them the full chat history
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.emit('chatHistory', chatHistory);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Use server.listen for Socket.IO integration
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
