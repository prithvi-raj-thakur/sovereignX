import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import { UserRepo, OtpRepo } from '../db';
import { sendOtpEmail } from '../services/resendService';
import { generateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

export const AuthController = {
  // Step 1 of Signup: Send OTP via Resend
  async sendSignupOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if user already exists and is registered
      const existingUser = await UserRepo.findByEmail(email);
      if (existingUser && existingUser.password) {
        return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await OtpRepo.saveOtp(email, otp, expiresAt);
      const emailResult = await sendOtpEmail(email, otp);

      return res.status(200).json({
        success: true,
        message: emailResult.message,
        email,
      });
    } catch (error: any) {
      console.error('Error in sendSignupOtp:', error);
      return res.status(500).json({ error: error.message || 'Failed to send OTP' });
    }
  },

  // Step 2 of Signup: Verify OTP and Register user into NeonDB
  async verifySignupOtp(req: Request, res: Response) {
    try {
      const { name, email, password, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
      }

      // Verify OTP against Database / Memory Store
      const isValidOtp = await OtpRepo.verifyOtp(email, otp);
      if (!isValidOtp) {
        return res.status(400).json({ error: 'Invalid or expired OTP code. Please try again.' });
      }

      // Hash password if provided
      let hashedPassword: string | undefined = undefined;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      const existingUser = await UserRepo.findByEmail(email);

      if (existingUser) {
        // Update user password and name if missing
        await UserRepo.updateUser(existingUser.id, {
          name: name || existingUser.name,
          password: hashedPassword || existingUser.password,
          is_verified: true,
        });
      } else {
        // Create new user in NeonDB
        await UserRepo.createUser({
          email,
          name: name || email.split('@')[0],
          password: hashedPassword,
          is_verified: true,
        });
      }

      // As specified: "after registering login is mandetory, for login otp isnt mandetory."
      return res.status(200).json({
        success: true,
        message: 'Registration successful! Please log in with your password.',
        redirectToLogin: true
      });
    } catch (error: any) {
      console.error('Error in verifySignupOtp:', error);
      return res.status(500).json({ error: error.message || 'Failed to complete registration' });
    }
  },

  // Login via Email & Password (No OTP required for login)
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await UserRepo.findByEmail(email);
      if (!user) {
        return res.status(400).json({ error: 'Account not found. Please sign up first.' });
      }

      if (!user.password) {
        return res.status(400).json({ error: 'This account was created using Google Login. Please sign in with Google.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const token = generateToken({ id: user.id, email: user.email });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
        },
      });
    } catch (error: any) {
      console.error('Error in login:', error);
      return res.status(500).json({ error: error.message || 'Login failed' });
    }
  },

  // Google OAuth Authorization Redirect
  async googleAuth(req: Request, res: Response) {
    try {
      if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('your_google')) {
        // Fallback for demo/testing when Google Client ID is not set
        const demoGoogleEmail = 'demo.user@gmail.com';
        let user = await UserRepo.findByEmail(demoGoogleEmail);
        if (!user) {
          user = await UserRepo.createUser({
            email: demoGoogleEmail,
            name: 'Demo Google User',
            google_id: 'google_123456789',
            avatar_url: 'https://lh3.googleusercontent.com/a/default-user',
            is_verified: true,
          });
        }
        const token = generateToken({ id: user.id, email: user.email });
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
      }

      const authUrl = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
        ],
        prompt: 'select_account',
      });

      return res.redirect(authUrl);
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      return res.redirect(`${FRONTEND_URL}/auth?error=google_failed`);
    }
  },

  // Google OAuth Callback Handler
  async googleCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        return res.redirect(`${FRONTEND_URL}/auth?error=no_code`);
      }

      const { tokens } = await googleClient.getToken(code);
      googleClient.setCredentials(tokens);

      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.redirect(`${FRONTEND_URL}/auth?error=invalid_google_payload`);
      }

      const email = payload.email;
      const name = payload.name || payload.given_name || email.split('@')[0];
      const googleId = payload.sub;
      const avatarUrl = payload.picture;

      let user = await UserRepo.findByEmail(email);

      if (user) {
        user = await UserRepo.updateUser(user.id, {
          google_id: googleId,
          avatar_url: avatarUrl || user.avatar_url,
          is_verified: true,
        });
      } else {
        user = await UserRepo.createUser({
          email,
          name,
          google_id: googleId,
          avatar_url: avatarUrl,
          is_verified: true,
        });
      }

      const token = generateToken({ id: user.id, email: user.email });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      return res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
    } catch (error: any) {
      console.error('Error in googleCallback:', error);
      return res.redirect(`${FRONTEND_URL}/auth?error=google_auth_failed`);
    }
  },

  // Get Current Authenticated User Profile
  async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await UserRepo.findByEmail(req.user.email);
      if (!user) {
        return res.status(444).json({ error: 'User not found' });
      }

      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
          is_verified: user.is_verified,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to fetch user' });
    }
  },

  // Logout Handler
  async logout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  }
};
