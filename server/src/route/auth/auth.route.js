import express from "express"
const router = express.Router()

import { resendVerification, login, signup, verifyEmail, refreshToken, getProfile, resetPassword, forgotPassword, logout, oauthCallback } from "../../controller/auth/auth.controller.js"
import { protectRoute, strictLimiter } from "../../middleware/middleware.js"
import passport from '../../config/passport.js';
import { validateLogin, handleValidationErrors, validateRegistration, validateForgot, validateResetPassword } from "../../middleware/validation/auth/auth.middleware.js";

router.post("/register", strictLimiter, validateRegistration, handleValidationErrors, signup)
router.get("/verify/:token", verifyEmail)
router.get("/profile", protectRoute, getProfile)
router.post("/resend-verification", resendVerification)
router.post("/refresh-token", refreshToken)

router.post("/login", strictLimiter, validateLogin, handleValidationErrors, login)
router.post("/logout", logout);

router.post("/forgot-password", validateForgot, handleValidationErrors, forgotPassword);
router.post("/reset-password/:token", validateResetPassword, handleValidationErrors, resetPassword)


router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const user = req.user;

      // Determine if new user (first time creation)
      const isNewUser = !user.last_login ||
        new Date(user.last_login).getTime() === new Date().getTime();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);
      await storeRefreshToken(user.id, refreshToken);

      // Set cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect based on whether user is new
      const redirectUrl = isNewUser
        ? `${process.env.CLIENT_URL}/onboarding?isNewUser=true`
        : `${process.env.CLIENT_URL}/dashboard`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
  }
);

export default router