export default function handler(req, res) {
  if (!process.env.WEBPUSH_PUBLIC_KEY) {
    return res.status(500).json({ error: 'Missing VAPID public key' });
  }
  res.json({ key: process.env.WEBPUSH_PUBLIC_KEY });
}
