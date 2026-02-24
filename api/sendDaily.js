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

export default async function handler(req, res) {
  const userRef = db.collection('users').doc('partner');
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    return res.status(404).send('User not found');
  }
  const user = userSnap.data() || {};
  const name = user.name || '';
  const birthday = user.birthday || '';

  const now = new Date();
  const localStr = now.toLocaleString('en-US', { timeZone: 'Asia/Manila' });
  const local = new Date(localStr);
  const mm = String(local.getMonth() + 1).padStart(2, '0');
  const dd = String(local.getDate()).padStart(2, '0');
  const today = `${mm}-${dd}`;

  let title = 'Daily Reminder';
  let body = '';
  if (birthday && birthday === today) {
    title = 'Happy Birthday 💖';
    body = 'Happy Birthday 💖 I’m always proud of you!';
  } else {
    const messages = [
      'Good morning 💛 galingan mo today ha!',
      'Good morning, ingat ka today ☀️',
      'It’s 12 already, kumain ka na ha 🍽️',
      'Lunch time na, wag mag skip ng kain ha 💛',
      'Proud ako sayo ✨',
      'Kaya mo yan today 💛'
    ];
    const idx = Math.floor(Math.random() * messages.length);
    body = messages[idx];
  }
  if (name) body = body.replace(/(^|\\s)([A-Z][a-z]+)?/, `$1`).trim();

  const subsSnap = await userRef.collection('subscriptions').get();
  const sends = [];
  subsSnap.forEach((doc) => {
    const sub = doc.data().subscription;
    if (!sub) return;
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      url: '/'
    });
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
  res.status(200).send('Notifications sent.');
}
