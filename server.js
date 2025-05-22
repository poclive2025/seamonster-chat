const express = require('express');
const cors = require("cors");
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());

// Memory storage for images (no uploads folder needed)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// In-memory chat store
const messages = [];

// Serve static files from public/
app.use(express.static('public'));

app.post('/chat', (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { username, message } = req.body;
    if (!username || !message)
      return res.status(400).json({ error: "Username and message required" });

    let imageUrl = null;

    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      const mime = req.file.mimetype;
      imageUrl = `data:${mime};base64,${base64}`;
    }

    const chatData = { username, message, imageUrl };
    messages.push(chatData);

    io.emit('newMessage', chatData); // Broadcast new chat
    res.json({ response: `${username}: ${message}` });
  });
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.emit('chatHistory', messages);

  // 🔼 NEW: Log username when client registers
  socket.on("registerUser", (data) => {
    console.log(`User registered on socket ${socket.id}: ${data.username}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
