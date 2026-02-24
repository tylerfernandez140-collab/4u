const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for user subscriptions (for testing)
const userSubscriptions = {
  'ivan': [],
  'angge': []
};

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Mock API routes for testing
app.get('/api/vapidPublicKey', (req, res) => {
  res.json({ 
    key: 'BHZXtHzK-WP3DmD_cXBXywoFaHjLsyLgwPp49JNX1g6qwA14KoQIoo3b2n4l247vTICLfZ4RSEhF' 
  });
});

app.post('/api/register', (req, res) => {
  console.log('Registration received:', req.body);
  const { userId, subscription } = req.body;
  
  if (userId && subscription) {
    // Store subscription for the user
    if (!userSubscriptions[userId]) {
      userSubscriptions[userId] = [];
    }
    userSubscriptions[userId].push(subscription);
    console.log(`Stored subscription for ${userId}:`, subscription.endpoint);
  }
  
  res.json({ ok: true });
});

app.post('/api/send-hug', (req, res) => {
  const { userId } = req.body;
  console.log(`Hug sent from ${userId}`);
  
  if (!userId) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  // Determine target user
  const targetUserId = userId === 'angge' ? 'ivan' : 'angge';
  const fromName = userId === 'angge' ? 'Angge' : 'Ivan';
  
  console.log(`Sending hug from ${fromName} to ${targetUserId}`);
  
  // Check if target user has subscriptions
  const targetSubscriptions = userSubscriptions[targetUserId] || [];
  
  if (targetSubscriptions.length === 0) {
    console.log(`No subscriptions found for ${targetUserId}`);
    return res.status(200).send('Hug sent (but no active recipients)');
  }
  
  // Log that we would send notifications
  console.log(`Would send ${targetSubscriptions.length} notification(s) to ${targetUserId}`);
  targetSubscriptions.forEach((sub, index) => {
    console.log(`  ${index + 1}. ${sub.endpoint}`);
  });
  
  // In a real implementation, you would use web-push.sendNotification() here
  // For now, we'll just log it
  const notificationPayload = {
    title: `${fromName} sent you a hug! 🤗`,
    body: 'Click to open the app',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    url: '/'
  };
  
  console.log('Notification payload:', notificationPayload);
  
  res.status(200).send(`Hug sent to ${targetUserId}!`);
});

app.post('/api/sendDaily', (req, res) => {
  console.log('Mock daily notification sent');
  res.status(200).send('Notifications sent.');
});

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Debug endpoint to see stored subscriptions
app.get('/debug/subscriptions', (req, res) => {
  res.json({
    subscriptions: userSubscriptions,
    totalUsers: Object.keys(userSubscriptions).length,
    totalSubscriptions: Object.values(userSubscriptions).flat().length
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Using mock APIs with cross-user notification simulation');
  console.log('Debug subscriptions at: http://localhost:3000/debug/subscriptions');
});
