import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { env } from "./env.js";
import { findOrCreateOAuthUser } from "../services/auth.service.js";

// session: false everywhere — we don't use Passport's session support at
// all. Passport's only job here is the OAuth handshake; once it resolves
// a user, our own JWT/refresh-token system (token.service.js) takes over
// identically to the email/password flow. No passport.serializeUser
// needed as a result.

passport.use(
  new GoogleStrategy(
    {
      clientID: env.google.clientId,
      clientSecret: env.google.clientSecret,
      callbackURL: env.google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || email;
        const user = await findOrCreateOAuthUser({ email, name });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: env.github.clientId,
      clientSecret: env.github.clientSecret,
      callbackURL: env.github.callbackUrl,
      scope: ["user:email"], // GitHub doesn't return email by default without this
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // GitHub can have multiple emails; prefer the primary verified one
        const email =
          profile.emails?.find((e) => e.primary)?.value || profile.emails?.[0]?.value;
        const name = profile.displayName || profile.username;

        if (!email) {
          return done(new Error("GitHub account has no accessible email address"));
        }

        const user = await findOrCreateOAuthUser({ email, name });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

export default passport;