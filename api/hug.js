// Simple in-memory storage for hugs (resets on function cold start)
let hugs = [];

module.exports = (req, res) => {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    if (req.method === 'POST') {
      // Store a new hug
      const { sender } = req.body || {};
      if (!sender) {
        return res.status(400).json({ error: 'Sender is required' });
      }
      
      const hug = {
        sender,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      };
      
      hugs.push(hug);
      
      // Keep only last 10 hugs to prevent memory buildup
      if (hugs.length > 10) {
        hugs = hugs.slice(-10);
      }
      
      console.log('Stored hug:', hug);
      return res.status(200).json({ success: true, hug });
    }
    
    if (req.method === 'GET') {
      // Get recent hugs (last 30 seconds)
      const now = Date.now();
      const recentHugs = hugs.filter(hug => (now - hug.timestamp) < 30000);
      
      console.log('Returning recent hugs:', recentHugs.length);
      return res.status(200).json({ hugs: recentHugs });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Hug API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
