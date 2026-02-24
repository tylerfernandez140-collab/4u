const admin = require('firebase-admin');
const crypto = require('crypto');

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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { name, birthday, subscription, userId } = req.body || {};
    if (!name || !birthday || !subscription || !subscription.endpoint || !userId) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const userRef = db.collection('users').doc(userId);
    await userRef.set({ name, birthday }, { merge: true });
    const id = crypto.createHash('sha256').update(subscription.endpoint).digest('hex');
    const subRef = userRef.collection('subscriptions').doc(id);
    await subRef.set({ subscription, createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
