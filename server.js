const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import API routes
const vapidPublicKeyHandler = require('./api/vapidPublicKey.js');
const registerHandler = require('./api/register.js');
const sendHugHandler = require('./api/send-hug.js');
const sendDailyHandler = require('./api/sendDaily.js');
const versionHandler = require('./api/version.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/vapidPublicKey', vapidPublicKeyHandler);
app.get('/api/version', versionHandler);
app.post('/api/register', registerHandler);
app.post('/api/send-hug', sendHugHandler);
app.post('/api/sendDaily', sendDailyHandler);

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure you have your environment variables set up for Firebase!');
});
