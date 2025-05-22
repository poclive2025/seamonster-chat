const express = require('express');
const cors = require("cors");
const multer = require('multer');
const app = express();

app.use(cors());

const PORT = process.env.PORT || 3000;

// Use memoryStorage to keep uploads in RAM only (no disk storage)
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

app.use(express.static('public'));
app.use(express.json());

app.post('/chat', (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { username, message } = req.body;
    console.log(`${username}: ${message}`);

    if (req.file) {
      console.log(`Received image in memory, size: ${req.file.size} bytes`);
      // req.file.buffer contains the image data — handle as needed
    }

    res.json({ response: `${username}: ${message}` });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
