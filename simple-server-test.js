const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Simple version endpoint
app.get('/api/version', (req, res) => {
  res.json({ 
    version: '2.0.0',
    forceUpdate: false,
    message: 'App is up to date'
  });
});

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Simple test server running on http://localhost:${PORT}`);
  console.log('Open your browser and navigate to http://localhost:3000');
});
