import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const oauthId = profile.id;
        const email = profile.emails[0].value;
        const username = profile.displayName.replace(/\s/g, "").toLowerCase();
        const profile_picture = profile.photos?.[0]?.value;

        // Check if user already exists
        let user = await prisma.user.findFirst({
          where: {
            OR: [{ oauth_id: oauthId }, { email }],
          },
          include: {
            role: {
              select: {
                role_id: true,
                name: true,
              },
            },
          },
        });

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              oauth_id: oauthId,
              oauth_provider: "google",
              email,
              username: username + "_" + Date.now(),
              profile_picture,
              role_id: 3, // Default user role
              status_id: 1,
              email_verified: true,
              last_login: new Date(),
              created_at: new Date(),
              updated_at: new Date(),
            },
            include: {
              role: {
                select: {
                  role_id: true,
                  name: true,
                },
              },
            },
          });
        } else {
          // Update existing user's last login
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              last_login: new Date(),
              oauth_id: oauthId,
              oauth_provider: "google",
              profile_picture,
            },
            include: {
              role: {
                select: {
                  role_id: true,
                  name: true,
                },
              },
            },
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          select: {
            role_id: true,
            name: true,
          },
        },
      },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;