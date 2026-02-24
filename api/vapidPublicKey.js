module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    console.log('VAPID public key request received');
    console.log('WEBPUSH_PUBLIC_KEY exists:', !!process.env.WEBPUSH_PUBLIC_KEY);
    
    if (!process.env.WEBPUSH_PUBLIC_KEY) {
      console.log('Missing VAPID public key, using fallback');
      const fallbackKey = 'BM7b1BQq1rRAGWCvpuRPRtx-XEtiXGOYoMDPzIp9lSNlnN088evvX8Ozo8Vw9ILcN6asxv8iSjuBXGAbNZeBbsA';
      return res.status(200).json({ key: fallbackKey });
    }
    
    console.log('Returning VAPID public key');
    res.status(200).json({ key: process.env.WEBPUSH_PUBLIC_KEY });
  } catch (error) {
    console.error('VAPID key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
