const express = require('express');
const path = require('path');
require('dotenv').config({ path: '.env.development.local' });

// Import API routes
const { handler: vapidPublicKeyHandler } = require('./api/vapidPublicKey.js');
const { handler: registerHandler } = require('./api/register.js');
const { handler: sendHugHandler } = require('./api/send-hug.js');
const { handler: sendDailyHandler } = require('./api/sendDaily.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/vapidPublicKey', vapidPublicKeyHandler);
app.post('/api/register', registerHandler);
app.post('/api/send-hug', sendHugHandler);
app.post('/api/sendDaily', sendDailyHandler);

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Debug endpoint to see subscriptions (remove in production)
app.get('/debug/subscriptions', (req, res) => {
  res.json({
    message: 'Debug endpoint - check Firebase for actual subscriptions',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Using real Firebase and WebPush APIs');
  console.log('Make sure your environment variables are set!');
});
