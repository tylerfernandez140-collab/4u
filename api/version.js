module.exports = (req, res) => {
  res.json({ 
    version: '2.0.0',
    forceUpdate: true,
    message: 'Please refresh to get cross-device hug functionality'
  });
};
