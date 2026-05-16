const router = require('express').Router();
const { searchUserRepos, getUserProfile, getRepoReadme } = require('../services/githubService');

// @route   GET /api/github/repos/:username
// @desc    Get user repos tagged with ConnectICT
router.get('/repos/:username', async (req, res) => {
  try {
    const keyword = process.env.APP_KEYWORD || 'ConnectICT';
    const repos = await searchUserRepos(req.params.username, keyword);
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/github/profile/:username
// @desc    Get GitHub profile info
router.get('/profile/:username', async (req, res) => {
  try {
    const profile = await getUserProfile(req.params.username);
    if (!profile) return res.status(404).json({ message: 'GitHub profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/github/repos/:owner/:repo/readme
// @desc    Get raw README content for a specific repository
router.get('/repos/:owner/:repo/readme', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const readme = await getRepoReadme(owner, repo);
    if (!readme) return res.status(404).json({ message: 'README not found' });
    res.send(readme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
