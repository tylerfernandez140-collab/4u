module.exports = (req, res) => {
  res.json({ 
    version: '2.0.0',
    forceUpdate: false, // Disabled to prevent refresh loop
    message: 'App is up to date with cross-device hug functionality'
  });
};
