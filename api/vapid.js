module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Simple hardcoded VAPID key for testing
    const vapidKey = 'BM7b1BQq1rRAGWCvpuRPRtx-XEtiXGOYoMDPzIp9lSNlnN088evvX8Ozo8Vw9ILcN6asxv8iSjuBXGAbNZeBbsA';
    
    console.log('VAPID endpoint called - returning key');
    res.status(200).json({ key: vapidKey });
  } catch (error) {
    console.error('VAPID endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
