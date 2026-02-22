// facebookAuth.js
// Facebook OAuth integration for Lidmi platform
// Requires: express, passport, passport-facebook, mongoose, dotenv

require('dotenv').config();

const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const router = express.Router();

// Load User model (adjust the path according to your project structure)
const User = require('./models/User');

// -----------------------------------------------------------------------------
// Passport Facebook Strategy Configuration
// -----------------------------------------------------------------------------
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.API_BASE_URL}/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      enableProof: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract needed data from Facebook profile
        const facebookId = profile.id;
        const email = profile.emails && profile.emails[0] && profile.emails[0].value;
        const firstName = profile.name?.givenName || '';
        const lastName = profile.name?.familyName || '';
        const avatar = profile.photos && profile.photos[0] && profile.photos[0].value;

        // Find existing user by Facebook ID
        let user = await User.findOne({ 'auth.facebook.id': facebookId });

        if (user) {
          // Update token & avatar if changed
          user.auth.facebook.accessToken = accessToken;
          if (avatar && user.avatar !== avatar) user.avatar = avatar;
          await user.save();
          return done(null, user);
        }

        // If no user with this Facebook ID, try to find by email (account linking)
        if (email) {
          user = await User.findOne({ email: email.toLowerCase() });
          if (user) {
            // Link Facebook account to existing user
            user.auth.facebook = {
              id: facebookId,
              accessToken,
            };
            if (avatar) user.avatar = avatar;
            await user.save();
            return done(null, user);
          }
        }

        // No existing user – create a brand‑new account
        const newUser = new User({
          email: email ? email.toLowerCase() : undefined,
          firstName,
          lastName,
          avatar,
          auth: {
            facebook: {
              id: facebookId,
              accessToken,
            },
          },
          // Mark email as verified if Facebook provided it
          emailVerified: !!email,
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        console.error('Facebook auth error:', err);
        return done(err, null);
      }
    }
  )
);

// -----------------------------------------------------------------------------
// Middleware to ensure user is authenticated (for linking accounts)
// -----------------------------------------------------------------------------
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------
// 1. Initiate Facebook login / signup
router.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
);

// 2. Facebook callback handling
router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: `${process.env.CLIENT_BASE_URL}/login?error=facebook`,
    session: true,
  }),
  (req, res) => {
    // Successful authentication – generate JWT / session token as per your auth flow
    // Example using JWT (adjust to your implementation)
    const token = req.user.generateJwt(); // assume User model has this method
    res.redirect(`${process.env.CLIENT_BASE_URL}/auth/success?token=${token}`);
  }
);

// 3. Link Facebook account to an already logged‑in user
router.get(
  '/auth/facebook/link',
  ensureAuthenticated,
  passport.authorize('facebook', { scope: ['email', 'public_profile'] })
);

router.get(
  '/auth/facebook/link/callback',
  ensureAuthenticated,
  passport.authorize('facebook', {
    failureRedirect: `${process.env.CLIENT_BASE_URL}/settings?error=link_facebook`,
    session: false,
  }),
  async (req, res) => {
    // req.account contains the Facebook profile
    const fbProfile = req.account;
    const user = req.user;

    // Attach Facebook credentials to the existing user
    user.auth.facebook = {
      id: fbProfile.id,
      accessToken: fbProfile.accessToken,
    };
    if (fbProfile.photos && fbProfile.photos[0]) {
      user.avatar = fbProfile.photos[0].value;
    }
    await user.save();

    // Redirect back to settings page with success flag
    res.redirect(`${process.env.CLIENT_BASE_URL}/settings?facebook=linked`);
  }
);

// 4. Unlink Facebook account
router.delete('/auth/facebook/unlink', ensureAuthenticated, async (req, res) => {
  try {
    req.user.auth.facebook = undefined;
    await req.user.save();
    res.json({ success: true, message: 'Facebook account unlinked' });
  } catch (err) {
    console.error('Unlink Facebook error:', err);
    res.status(500).json({ success: false, error: 'Unable to unlink Facebook account' });
  }
});

module.exports = router;