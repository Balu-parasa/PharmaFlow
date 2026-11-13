import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { AuthRequest, getJwtSecret } from '../middlewares/auth.middleware.js';

const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
const REFRESH_TOKEN_DAYS = 7;
const REFRESH_COOKIE_NAME = 'capsulix_refresh_token';

const isProduction = process.env.NODE_ENV === 'production';

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateAccessToken = (user: { id: string; email: string; role: string; name: string }): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    getJwtSecret(),
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

const issueRefreshToken = async (userId: string): Promise<string> => {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt
    }
  });

  return rawToken;
};

// Cross-origin deployment cookie configuration:
// For separate origins (Frontend on Vercel, Backend on Render), SameSite must be 'none' and Secure must be true.
// In local development, SameSite can be 'lax' without requiring HTTPS.
const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  path: '/api/auth'
});

const setRefreshTokenCookie = (res: Response, rawToken: string) => {
  res.cookie(REFRESH_COOKIE_NAME, rawToken, getCookieOptions());
};

const clearRefreshTokenCookie = (res: Response) => {
  const options = getCookieOptions();
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path
  });
};

// CSRF Origin verification for cookie-authenticated auth requests
export const verifyOriginForAuth = (req: Request, res: Response): boolean => {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  const requestOrigin = req.headers.origin;
  
  // In browser cross-origin requests, Origin header is guaranteed for POST
  if (requestOrigin && requestOrigin !== clientOrigin) {
    res.status(403).json({ success: false, message: 'Forbidden: Cross-site request rejected.' });
    return false;
  }
  return true;
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'CASHIER',
        phone
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    const accessToken = generateAccessToken(user);
    const rawRefreshToken = await issueRefreshToken(user.id);
    setRefreshTokenCookie(res, rawRefreshToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token: accessToken }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const rawRefreshToken = await issueRefreshToken(user.id);
    setRefreshTokenCookie(res, rawRefreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        },
        token: accessToken
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    if (!verifyOriginForAuth(req, res)) {
      return;
    }

    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!rawToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const tokenHash = hashToken(rawToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    // Reuse detection / invalid token
    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      clearRefreshTokenCookie(res);
      if (storedToken && storedToken.revoked) {
        // Potential token theft: Revoke all refresh tokens for this user
        await prisma.refreshToken.updateMany({
          where: { userId: storedToken.userId },
          data: { revoked: true }
        });
      }
      return res.status(401).json({ success: false, message: 'Refresh token expired or invalid' });
    }

    if (!storedToken.user || !storedToken.user.isActive) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ success: false, message: 'User account is deactivated or invalid' });
    }

    // Token rotation: Revoke current token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true }
    });

    // Issue new refresh token & access token
    const newRawRefreshToken = await issueRefreshToken(storedToken.userId);
    setRefreshTokenCookie(res, newRawRefreshToken);

    const accessToken = generateAccessToken(storedToken.user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: {
          id: storedToken.user.id,
          name: storedToken.user.name,
          email: storedToken.user.email,
          role: storedToken.user.role,
          phone: storedToken.user.phone
        },
        token: accessToken
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    if (!verifyOriginForAuth(req, res)) {
      return;
    }

    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revoked: true }
      });
    }
    clearRefreshTokenCookie(res);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    clearRefreshTokenCookie(res);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

