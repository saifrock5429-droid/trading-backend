const User = require('../models/User');

// Temp Auth Middleware for testing (Headers se User-Id read karega)
const protect = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({ message: 'Authorization failed! Header me user-id pass karein.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User nahi mila!' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid User ID', error: error.message });
  }
};

module.exports = { protect };