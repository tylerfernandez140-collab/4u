function handler(req, res) {
  console.log('VAPID public key request received');
  console.log('WEBPUSH_PUBLIC_KEY exists:', !!process.env.WEBPUSH_PUBLIC_KEY);
  console.log('Environment variables:', Object.keys(process.env).filter(key => key.includes('WEBPUSH')));
  
  if (!process.env.WEBPUSH_PUBLIC_KEY) {
    console.log('Missing VAPID public key, using fallback');
    // Fallback VAPID key for testing
    const fallbackKey = 'BM7b1BQq1rRAGWCvpuRPRtx-XEtiXGOYoMDPzIp9lSNlnN088evvX8Ozo8Vw9ILcN6asxv8iSjuBXGAbNZeBbsA';
    return res.json({ key: fallbackKey });
  }
  
  console.log('Returning VAPID public key');
  res.json({ key: process.env.WEBPUSH_PUBLIC_KEY });
}

module.exports = { handler };
