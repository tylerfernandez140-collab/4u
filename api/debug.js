function handler(req, res) {
  console.log('Debug endpoint called');
  
  const envVars = {
    WEBPUSH_PUBLIC_KEY: process.env.WEBPUSH_PUBLIC_KEY ? 'SET' : 'NOT SET',
    WEBPUSH_PRIVATE_KEY: process.env.WEBPUSH_PRIVATE_KEY ? 'SET' : 'NOT SET',
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'NOT SET',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || 'NOT SET',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET'
  };
  
  const allEnvKeys = Object.keys(process.env).filter(key => 
    key.includes('WEBPUSH') || 
    key.includes('FIREBASE') || 
    key.includes('NODE_ENV')
  );
  
  res.json({
    message: 'Environment variables debug',
    envVars,
    allEnvKeys,
    timestamp: new Date().toISOString()
  });
}

module.exports = { handler };
