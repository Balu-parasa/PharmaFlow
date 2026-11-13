import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getProfile, refreshToken, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../schemas/index.js';

const router = Router();

// Rate limiter for authentication endpoints to prevent brute-force attacks
const isTestEnv = process.env.NODE_ENV === 'test';
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: isTestEnv ? 1000 : 10, // 10 attempts per IP per 15 minutes in dev/prod
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

router.post('/register', validate(registerSchema), register);
router.post('/login', loginRateLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/profile', authenticate, getProfile);

export default router;

