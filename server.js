const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const multer = require('multer');
const cors = require("cors");
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  // adjust in prod
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

const chatMessages = [];  // Store chat messages here

// Serve uploaded images from /tmp
app.use('/uploads', express.static('/tmp'));

// Note: upload image and message handled via REST POST for simplicity
app.post('/chat', upload.single('avatar'), (req, res) => {
  const { username, message } = req.body;
  let imageUrl = null;

  if (req.file) {
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join('/tmp', fileName);
    fs.writeFileSync(filePath, req.file.buffer);
    imageUrl = `/uploads/${fileName}`;
  }

  const chat = { username, message, imageUrl };
  chatMessages.push(chat);

  // Broadcast new message to all connected clients
  io.emit('newMessage', chat);

  res.json(chat);
});

// Socket.io connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send all previous chat messages to new client
  socket.emit('chatHistory', chatMessages);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
