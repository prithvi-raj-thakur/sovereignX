import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Registration with OTP (Resend)
router.post('/send-otp', AuthController.sendSignupOtp);
router.post('/verify-otp', AuthController.verifySignupOtp);

// Direct Email + Password Login (No OTP required)
router.post('/login', AuthController.login);

// Google OAuth 2.0
router.get('/google', AuthController.googleAuth);
router.get('/google/callback', AuthController.googleCallback);

// Profile & Logout
router.get('/me', requireAuth, AuthController.getMe as any);
router.post('/logout', AuthController.logout);

export default router;
