const express = require('express');
const cors = require("cors");
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');
const sharp = require("sharp"); // 🔼 NEW: Import sharp for image conversion

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());

const PORT = process.env.PORT || 3000;

// In-memory image storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    cb(null, allowed.includes(file.mimetype));
  }
});

const messages = [];

app.use(express.static('public'));

app.post('/chat', (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { username, message } = req.body;
    if (!username || !message) return res.status(400).json({ error: "Username and message required" });

    // 🧠 Function to send message + image
    function finishMessage(imageUrl) {
      const chatData = { username, message, imageUrl };
      messages.push(chatData);
      io.emit('newMessage', chatData);
      res.json({ response: `${username}: ${message}` });
    }

    // ✅ Convert HEIC/HEIF → JPEG if needed
    if (req.file) {
      const mime = req.file.mimetype;

      if (mime === 'image/heic' || mime === 'image/heif') {
        sharp(req.file.buffer)
          .jpeg()
          .toBuffer()
          .then((convertedBuffer) => {
            const imageUrl = `data:image/jpeg;base64,${convertedBuffer.toString('base64')}`;
            finishMessage(imageUrl);
          })
          .catch(err => {
            console.error("Image conversion failed", err);
            res.status(500).json({ error: "Image conversion failed" });
          });
      } else {
        // Send JPG/PNG as-is
        const imageUrl = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
        finishMessage(imageUrl);
      }
    } else {
      finishMessage(null); // No image
    }
  });
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.emit('chatHistory', messages);

  socket.on("registerUser", (data) => {
    console.log(`User registered on socket ${socket.id}: ${data.username}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
