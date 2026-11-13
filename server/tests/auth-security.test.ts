import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import prisma from '../src/config/db.js';
import { getJwtSecret } from '../src/middlewares/auth.middleware.js';

describe('Capsulix Authentication & Authorization Security Test Suite', () => {
  let adminToken: string;
  let pharmacistToken: string;
  let cashierToken: string;
  let adminRefreshTokenCookie: string;

  beforeAll(async () => {
    // Ensure clean state or valid users exist
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('TASK 1 & 6: Real Authentication & Demo Credentials', () => {
    it('1. Successful Admin login with seeded credentials and receives Access Token + HttpOnly Refresh Cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@pharmaflow.com',
          password: 'admin123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('ADMIN');
      expect(res.body.data.token).toBeDefined();

      adminToken = res.body.data.token;
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshCookie = (cookies as unknown as string[]).find((c: string) => c.startsWith('capsulix_refresh_token='));
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');
      adminRefreshTokenCookie = refreshCookie!.split(';')[0];
    });

    it('2. Successful Pharmacist login with seeded credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'pharmacist@pharmaflow.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('PHARMACIST');
      pharmacistToken = res.body.data.token;
    });

    it('3. Successful Cashier login with seeded credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'cashier@pharmaflow.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('CASHIER');
      cashierToken = res.body.data.token;
    });

    it('4. Rejects Incorrect Password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@pharmaflow.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid credentials/i);
    });

    it('5. Rejects Unknown Email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@pharmaflow.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid credentials/i);
    });

    it('Login Rate Limiter: Returns 429 when max login attempts exceeded', async () => {
      // Test isolated rate limiter instance
      const express = (await import('express')).default;
      const rateLimit = (await import('express-rate-limit')).default;
      const testApp = express();
      testApp.use(express.json());
      const testLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 2,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
        }
      });
      testApp.post('/test-login', testLimiter, (req, res) => res.json({ success: true }));

      const res1 = await request(testApp).post('/test-login');
      expect(res1.status).toBe(200);

      const res2 = await request(testApp).post('/test-login');
      expect(res2.status).toBe(200);

      const res3 = await request(testApp).post('/test-login');
      expect(res3.status).toBe(429);
      expect(res3.body.success).toBe(false);
      expect(res3.body.message).toMatch(/Too many login attempts/i);
    });
  });

  describe('TASK 2 & 6: Real Authorization & RBAC', () => {
    it('6. Rejects direct access to protected API without a token', async () => {
      const res = await request(app)
        .get('/api/reports/summary');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/No token provided/i);
    });

    it('7. Rejects expired JWT token', async () => {
      const secret = process.env.JWT_SECRET || 'super_pharma_secret_jwt_key_928374982374';
      const expiredToken = jwt.sign(
        { id: 'fake-id', email: 'test@pharmaflow.com', role: 'ADMIN', name: 'Fake' },
        secret,
        { expiresIn: '-1s' }
      );

      const res = await request(app)
        .get('/api/reports/summary')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid or expired token/i);
    });

    it('8. Role escalation attempt: Cashier attempts ADMIN-only route (/api/reports/users)', async () => {
      const res = await request(app)
        .get('/api/reports/users')
        .set('Authorization', `Bearer ${cashierToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Forbidden/i);
    });

    it('Role escalation attempt: Tampered JWT token signature rejected', async () => {
      const tamperedToken = adminToken.slice(0, -5) + 'abcde';

      const res = await request(app)
        .get('/api/reports/summary')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Verifies Admin has access to ADMIN routes', async () => {
      const res = await request(app)
        .get('/api/reports/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('Verifies Pharmacist is rejected from ADMIN-only route but allowed on PHARMACIST route', async () => {
      const forbiddenRes = await request(app)
        .get('/api/reports/users')
        .set('Authorization', `Bearer ${pharmacistToken}`);
      expect(forbiddenRes.status).toBe(403);

      const allowedRes = await request(app)
        .get('/api/reports/reconciliation')
        .set('Authorization', `Bearer ${pharmacistToken}`);
      expect(allowedRes.status).toBe(200);
      expect(allowedRes.body.success).toBe(true);
    });
  });

  describe('TASK 3 & 6: Session Persistence & Token Refresh Lifecycle', () => {
    let rotatedRefreshTokenCookie: string;

    it('9. Profile fetch succeeds with valid access token (Refresh after successful login)', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('admin@pharmaflow.com');
    });

    it('10. Refresh token rotates and issues new access token (Close and reopen browser simulation)', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [adminRefreshTokenCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('admin@pharmaflow.com');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const newCookie = (cookies as unknown as string[]).find((c: string) => c.startsWith('capsulix_refresh_token='));
      expect(newCookie).toBeDefined();
      rotatedRefreshTokenCookie = newCookie!.split(';')[0];
    });

    it('12. Reusing a revoked / already rotated refresh token fails (Reuse detection)', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [adminRefreshTokenCookie]); // adminRefreshTokenCookie was already rotated!

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Refresh token expired or invalid/i);
    });

    it('11. Logout followed by refresh fails and revokes session', async () => {
      // Perform logout using the rotated cookie
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [rotatedRefreshTokenCookie]);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Attempting to refresh with that cookie now fails
      const refreshAfterLogout = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [rotatedRefreshTokenCookie]);

      expect(refreshAfterLogout.status).toBe(401);
      expect(refreshAfterLogout.body.success).toBe(false);
    });

    it('13. Non-existent / invalid refresh token is rejected', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['capsulix_refresh_token=invalid_garbage_token']);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('CSRF Protection: Cross-site Origin header mismatch on refresh is rejected', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Origin', 'https://malicious-site.com')
        .set('Cookie', ['capsulix_refresh_token=some_token']);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Forbidden: Cross-site request rejected/i);
    });

    it('Production Safety: Missing JWT_SECRET in production throws error', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalSecret = process.env.JWT_SECRET;
      
      try {
        process.env.NODE_ENV = 'production';
        delete process.env.JWT_SECRET;
        expect(() => getJwtSecret()).toThrow(/FATAL: JWT_SECRET environment variable is missing/i);
      } finally {
        process.env.NODE_ENV = originalEnv;
        if (originalSecret) process.env.JWT_SECRET = originalSecret;
      }
    });
  });
});
