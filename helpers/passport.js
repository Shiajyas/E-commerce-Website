const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../models/userSchema");
const { v4: uuidv4 } = require("uuid");

passport.use(new GoogleStrategy(
  {
    clientID: "YOUR_GOOGLE_CLIENT_ID",   // <-- replace
    clientSecret: "YOUR_GOOGLE_CLIENT_SECRET", // <-- replace
    callbackURL: "https://e-commerce-website-dd3r.onrender.com/auth/google/callback",
    passReqToCallback: true,
    scope: ["email", "profile"]
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log("Google authentication callback reached.");

      const referralCode = uuidv4();
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          referralCode: referralCode,
          profilePicture: profile.picture || null
        });
        await user.save();
      }

      req.session.user = user._id;
      console.log(req.session.user, "<<<<<<<<<<<<< user saved in session");

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

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

module.exports = passport;
