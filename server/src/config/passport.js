import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import prisma from '../config/database.js'; // Your database config

import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { google_id: profile.id },
        });

        if (user) {
          // User exists, return user
          return done(null, user);
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              google_id: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos[0].value,
              email_verified: true, // Google emails are verified
              created_at: new Date(),
              updated_at: new Date(),
            },
          });

          return done(null, user);
        }
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
