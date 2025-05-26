const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// In-memory store (for demo purposes)
let habitsByUser = {};

// Routes
app.get('/habits/:userId', (req, res) => {
  const { userId } = req.params;
  res.json(habitsByUser[userId] || []);
});

app.post('/habits/:userId', (req, res) => {
  const { userId } = req.params;
  const { habits } = req.body;
  habitsByUser[userId] = habits;
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
