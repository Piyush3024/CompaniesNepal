import pkg from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redis } from "../../lib/redis.js";
import sendVerificationEmail from "../../lib/mailer.js";
import { sendEmail, emailTemplates } from "../../config/email.config.js";
import { encodeId, decodeId } from "../../lib/secure.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const generateVerificationToken = (userId) => {
  return jwt.sign({ userId }, process.env.EMAIL_VERIFICATION_SECRET, {
    expiresIn: "2m",
  });
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  );
};

const setCookies = (res, accessToken, refreshToken) => {
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
};


export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const loginIdentifier = username || email;


    const user = await prisma.user.findUnique({
      where: {
        OR: [
          { email: loginIdentifier },
          { username: loginIdentifier }
        ]
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });

    }

    if (user.is_blocked) {
      if (user.blocked_until && new Date() > user.blocked_until) {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            is_blocked: false,
            blocked_until: null,
          },
        });
      } else {
        return res.status(403).json({
          success: false,
          error: "Your account is temporarily blocked",
          blocked_until: user.blocked_until,
        });
      }
    }

    if (!user.email_verified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }


    const { accessToken, refreshToken } = generateTokens(user.id);
    await storeRefreshToken(user.id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        id: encodeId(user.id),
        email: user.email,
        profile_picture: user.profile_picture,
        email_verified: user.email_verified,
        username: user.username,
        role: {
          ...user.role,
          role_id: encodeId(user.role.role_id),
        },
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
};

export const signup = async (req, res) => {
  try {
    const { username, email, password, phone, role_id } = req.body;


    const roleId = parseInt(role_id);



    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone,
        role_id: roleId,
        email_verified: false,
        updated_at: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role_id: true,
        email_verified: true,
      },
    });


    const verificationToken = generateVerificationToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { email_verification_token: verificationToken },
    });

    try {

      await sendVerificationEmail(email, verificationToken, username);

    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      console.log("User: ", user);
      return res.status(500).json({
        success: false,
        message:
          "User created, but failed to send verification email. Please try resending.",
        data: user,
      });
    }
    try {
      const emailContent = emailTemplates.welcomeEmail(username);
      await sendEmail({
        to: user.email,
        ...emailContent,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      data: user,
    });
  } catch (error) {
    console.error("Signup Error :", error);
    res.status(500).json({
      success: false,
      error: "Error during registration",
      error: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);


    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        email_verification_token: token,
      },
    });

    if (!user) {

      const existingUser = await prisma.user.findUnique({
        where: {
          id: decoded.userId,
        },
      });

      if (existingUser && existingUser.email_verified) {
        // User is already verified, return success
        return res.json({
          success: true,
          message: "Email already verified!",
          redirectTo: "/login",
        });
      }

      console.log("User not found or token mismatch");
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        email_verification_token: null,
      },
    });

    res.json({
      success: true,
      message: "Email verified successfully!",
      redirectTo: "/login",
    });
  } catch (error) {
    console.error("Error during email verification:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Verification token has expired. Please request a new one.",
      });
    }
    res.status(400).json({
      success: false,
      message: "Invalid verification token",
    });
  }
};


export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const verificationToken = generateVerificationToken(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { email_verification_token: verificationToken },
    });

    try {
      await sendVerificationEmail(user.email, verificationToken, user.username);
    } catch (emailError) {
      console.error("Failed to resend verification email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to resend verification email",
        error: emailError.message,
      });
    }

    res.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Error in resendVerification controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resending verification",
      error: error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided"
      });
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (tokenError) {
      console.error('Refresh token verification failed:', tokenError);

      // Clear invalid cookies
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        domain: process.env.COOKIE_DOMAIN || undefined,
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        domain: process.env.COOKIE_DOMAIN || undefined,
      });

      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token"
      });
    }

    // Check if refresh token exists in Redis
    const storedRefreshToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    // Get user from database
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      }
    });

    if (!user) {
      // Remove invalid refresh token from Redis
      await redis.del(`refresh_token:${decoded.userId}`);

      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.is_active) {
      // Remove refresh token for inactive user
      await redis.del(`refresh_token:${decoded.userId}`);

      return res.status(401).json({
        success: false,
        message: "Account is inactive"
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    // Store new refresh token in Redis
    await storeRefreshToken(user.id, newRefreshToken);

    // Set new cookies
    setCookies(res, accessToken, newRefreshToken);

    // Update user's last login
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        id: encodeId(user.id),
        email: user.email,
        username: user.username,
        role: user.role,
        isTemporaryPassword: user.isTemporaryPassword
      }
    });

  } catch (error) {
    console.error("Error in refresh token controller:", error);
    return res.status(500).json({
      success: false,
      message: "Error during token refresh",
      error: error.message
    });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    let userId = null;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        userId = decoded.userId;

        // Remove refresh token from Redis
        await redis.del(`refresh_token:${userId}`);

      } catch (tokenError) {
        console.error('Token verification failed during logout:', tokenError);
      }
    }

    // Clear cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error occurred during logout',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.is_blocked) {
      return res.status(403).json({
        success: false,
        message: "User is blocked",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error in getProfile controller:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

export const oauthCallback = async (profile, provider, done) => {
  try {
    const oauthId = profile.id;
    const email = profile.emails[0].value;
    const username =
      profile.username || profile.displayName.replace(/\s/g, "").toLowerCase();
    const image = profile.photos?.[0]?.value;

    // Check if user exists by oauth_id or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ oauth_id: oauthId }, { email }],
      },
      include: {
        role: true,
      },
    });

    let isNewUser = false;

    if (user) {
      // Existing user: update details if needed
      user = await prisma.user.update({
        where: { user_id: user.user_id },
        data: {
          oauth_id: oauthId,
          oauth_provider: provider,
          username,
          full_name,
          image,
          location,
          email_verified: true,
          updated_at: new Date(),
        },
        include: {
          role: true,
        },
      });
    } else {
      // New user: create with default role_id (3 for Student)
      user = await prisma.user.create({
        data: {
          oauth_id: oauthId,
          oauth_provider: provider,
          email,
          username,
          full_name,
          image,
          location,
          role_id: 3, // Student role
          email_verified: true,
          updated_at: new Date(),
        },
        include: {
          role: true,
        },
      });
      isNewUser = true;
    }

    const { accessToken, refreshToken } = generateTokens(user.user_id);
    await storeRefreshToken(user.user_id, refreshToken);

    // Return user data with isNewUser flag
    return done(null, {
      user,
      accessToken,
      refreshToken,
      isNewUser,
    });
  } catch (error) {
    console.error(`Error in ${provider} OAuth callback:`, error);
    return done(error, null);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate reset token (15 minutes expiry)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.PASSWORD_RESET_SECRET,
      { expiresIn: "15m" }
    );

    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_reset_token: resetToken,
        password_reset_expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    // Create reset link
    const resetLink = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

    // Send password reset email
    try {
      const emailContent = emailTemplates.passwordResetEmail(
        user.username,
        resetLink
      );
      await sendEmail({
        to: user.email,
        ...emailContent,
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }

    res.json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Error in forgotPassword controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing forgot password request",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Verify reset token
    const decoded = jwt.verify(token, process.env.PASSWORD_RESET_SECRET);

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        password_reset_token: token,
        password_reset_expires: {
          gt: new Date(), // Token should not be expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    //Check if new password is same as existing password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message:
          "Please use a different password. You cannot use your previous password.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null,
        updated_at: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error in resetPassword controller:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Reset token has expired. Please request a new one.",
      });
    }
    res.status(400).json({
      success: false,
      message: "Invalid reset token",
    });
  }
};

export const createUser = async (req, res) => {
  try {
    // Only admin can call this (middleware enforced)
    const { username, email, password, full_name, phone, role_id, location } =
      req.body;
    const roleId = parseInt(role_id);

    if (!username || !email || !password || !full_name || !role_id) {
      return res.status(400).json({
        success: false,
        message:
          "Username, email, password, full_name, and role_id are required",
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    // Handle image upload if present
    let imageUrl = null;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "user_profiles",
          resource_type: "auto",
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Failed to upload image:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile image",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        full_name,
        phone,
        role_id: roleId,
        location,
        image: imageUrl,
        email_verified: false,
        updated_at: new Date(),
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        full_name: true,
        phone: true,
        role_id: true,
        location: true,
        image: true,
        email_verified: true,
      },
    });

    // Generate verification token
    const verificationToken = generateVerificationToken(user.user_id);
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { verification_token: verificationToken },
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return res.status(500).json({
        success: false,
        message:
          "User created, but failed to send verification email. Please try resending.",
        data: user,
      });
    }

    // Send welcome email
    try {
      const emailContent = emailTemplates.welcomeEmail(full_name);
      await sendEmail({
        to: user.email,
        ...emailContent,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "User registered. Please check email to verify account.",
      data: user,
    });
  } catch (error) {
    console.error("createUser error:", error);
    res.status(500).json({
      success: false,
      message: "Error during user creation",
      error: error.message,
    });
  }
};
