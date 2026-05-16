const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email', 'read:user'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          if (user.isActive === false) {
            return done(null, false, { message: 'Your account has been deactivated by an administrator.' });
          }

          // Legacy role migration to prevent validation errors
          const legacyMap = { junior: '1st Year', senior: '3rd Year', alumni: 'Alumni' };
          if (legacyMap[user.role]) {
            user.role = legacyMap[user.role];
          }

          user.lastActive = new Date();
          user.githubAccessToken = accessToken;
          user.avatar = profile.photos?.[0]?.value || user.avatar;
          await user.save();
          return done(null, user);
        }

        // Create new user
        const emails = profile.emails || [];
        const primaryEmail = emails.find((e) => e.primary)?.value || emails[0]?.value || '';

        user = await User.create({
          githubId: profile.id,
          username: profile.username,
          name: profile.displayName || profile.username,
          email: primaryEmail,
          avatar: profile.photos?.[0]?.value || '',
          bio: profile._json.bio || '',
          githubAccessToken: accessToken,
          profileCompleted: false,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
