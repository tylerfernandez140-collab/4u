const admin = require('firebase-admin');
const webpush = require('web-push');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}
const db = admin.firestore();

// Configure web-push
webpush.setVapidDetails(
  'mailto:example@example.com',
  process.env.WEBPUSH_PUBLIC_KEY,
  process.env.WEBPUSH_PRIVATE_KEY
);

async function handler(req, res) {
  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const targetUserId = userId === 'angge' ? 'partner' : 'angge';
  const fromName = userId === 'angge' ? 'Angge' : 'You';
  const sender = fromName;

  const userRef = db.collection('users').doc(targetUserId);
  const subsSnap = await userRef.collection('subscriptions').get();
  const sends = [];
  const payload = JSON.stringify({
    title: `${sender} sent you a hug! 🤗`,
    body: 'Tap to open and see your hug!',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    vibrate: [200, 100, 200], // Vibrate pattern
    sound: '/notification-sound.mp3', // Sound file
    requireInteraction: true, // Keep notification until user interacts
    data: { url: '/', sender, targetUser: targetUserId }
  });

  subsSnap.forEach((doc) => {
    const sub = doc.data().subscription;
    if (!sub) return;
    sends.push(
      webpush
        .sendNotification(sub, payload)
        .catch(async (err) => {
          if (err && (err.statusCode === 410 || err.statusCode === 404)) {
            await doc.ref.delete();
          }
        })
    );
  });

  await Promise.all(sends);
  res.status(200).send('Hug sent.');
}

module.exports = { handler };
