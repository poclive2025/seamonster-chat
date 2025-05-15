




const express = require('express');

const cors = require("cors");


const path = require('path');
const app = express();

app.use(cors());


const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/chat', (req, res) => {
  const { username, message } = req.body;
  console.log(`${username}: ${message}`);
  res.json({ response: `${username}: ${message}` });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
