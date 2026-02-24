module.exports = (req, res) => {
  console.log('VAPID public key request received');
  console.log('WEBPUSH_PUBLIC_KEY exists:', !!process.env.WEBPUSH_PUBLIC_KEY);
  
  if (!process.env.WEBPUSH_PUBLIC_KEY) {
    console.log('Missing VAPID public key, using fallback');
    const fallbackKey = 'BM7b1BQq1rRAGWCvpuRPRtx-XEtiXGOYoMDPzIp9lSNlnN088evvX8Ozo8Vw9ILcN6asxv8iSjuBXGAbNZeBbsA';
    return res.json({ key: fallbackKey });
  }
  
  console.log('Returning VAPID public key');
  res.json({ key: process.env.WEBPUSH_PUBLIC_KEY });
};
