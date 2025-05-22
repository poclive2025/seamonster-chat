const express = require('express');
const multer = require('multer');          // For file uploads
const cors = require("cors");
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Multer setup: use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// In-memory chat messages (optional, for demo)
const chatMessages = [];

// Chat endpoint with optional file upload
app.post('/chat', upload.single('avatar'), (req, res) => {
  const { username, message } = req.body;
  let imageUrl = null;

  if (req.file) {
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join('/tmp', fileName);

    // Write image buffer to /tmp folder
    fs.writeFileSync(filePath, req.file.buffer);
    imageUrl = `/uploads/${fileName}`;
  }

  const chat = { username, message, imageUrl };
  chatMessages.push(chat);

  res.json(chat);
});

// Serve images from /tmp at /uploads URL
app.use('/uploads', express.static('/tmp'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
