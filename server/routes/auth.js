const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// @route   GET /api/auth/github
// @desc    Start GitHub OAuth flow
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'read:user'] }));

// @route   GET /api/auth/github/callback
// @desc    GitHub OAuth callback
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed` }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Redirect to frontend with token
    const redirectUrl = req.user.profileCompleted
      ? `${process.env.CLIENT_URL}/auth/callback?token=${token}`
      : `${process.env.CLIENT_URL}/auth/callback?token=${token}&setup=true`;

    res.redirect(redirectUrl);
  }
);

// @route   GET /api/auth/me
// @desc    Get current authenticated user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require('../models/User');
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout (client-side token removal, server-side session destroy)
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
