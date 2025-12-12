import express from "express"
const router = express.Router() 

import { resendVerification, login, signup,verifyEmail,refreshToken ,getProfile, resetPassword , forgotPassword , logout} from "../controller/auth.controller.js"
import {verifyToken , strictLimiter} from "../middleware/middleware.js"
import passport from '../config/passport.js';

router.post("/register",strictLimiter , signup)
router.get("/verify/:token" , verifyEmail)
router.get("/profile" , verifyToken , getProfile)
router.post("/resend-verification" , resendVerification)
router.post("/refresh-token" , refreshToken)

router.post("/login" ,strictLimiter, login)
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token" , resetPassword)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { 
  failureRedirect: `${process.env.CLIENT_URL}/login`,
  session: false
}), (req, res) => {
  const { accessToken, refreshToken, isNewUser } = req.user;
  
  // Set cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  // Redirect based on whether user is new
  if (isNewUser) {
    res.redirect(`${process.env.CLIENT_URL}/role-selection`);
  } else {
    res.redirect(`${process.env.CLIENT_URL}/`);
  }
});

export default router