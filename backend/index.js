const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/crickscore', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ScoreSchema = new mongoose.Schema({
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  currentOver: { type: Number, default: 0 },
  currentBall: { type: Number, default: 0 },
  overs: [
    {
      runsPerBall: [Number],
    },
  ],
});

const Score = mongoose.model('Score', ScoreSchema);

// Middleware to check and initialize database if empty
async function initializeDatabase(req, res, next) {
  let score = await Score.findOne();
  if (!score) {
    score = new Score({
      runs: 0,
      wickets: 0,
      currentOver: 0,
      currentBall: 0,
      overs: [],
    });
    await score.save();
    console.log('Database initialized.');
  }
  req.score = score; // Pass the score to the next middleware
  next();
}

// Get Current Data
app.get('/score', initializeDatabase, async (req, res) => {
  res.send(req.score);
});

// Update Score
app.post('/score', initializeDatabase, async (req, res) => {
  const { action } = req.body; // action can be { runs: x } or { out: true }
  const score = req.score;

  const isWicket = action.out || false;
  const runs = action.runs || 0;

  if (!score.overs[score.currentOver]) {
    score.overs.push({ runsPerBall: [] });
  }

  score.overs[score.currentOver].runsPerBall[score.currentBall] = isWicket ? -1 : runs;

  if (!isWicket) {
    score.runs += runs;
  } else {
    score.wickets += 1;
  }

  score.currentBall += 1;

  if (score.currentBall >= 6) {
    score.currentOver += 1;
    score.currentBall = 0;
  }

  await score.save();
  io.emit('update', score); // Notify clients
  res.send(score);
});

// Start Server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
