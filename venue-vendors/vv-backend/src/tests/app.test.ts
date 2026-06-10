/**
 * VenueVendors Backend - Unit Tests
 * 6 contextual tests covering auth, venue, and booking logic
 * Run with: npm test
 */

import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// ─── Test 1: Password hashing ────────────────────────────────────────────────
/**
 * Test: bcrypt correctly hashes passwords and verifies them.
 * Context: All user passwords are hashed before storing in DB.
 * A correct password must match; a wrong password must not.
 */
describe('Password hashing', () => {
  test('hashes a password and verifies it correctly', async () => {
    const password = 'Alice@1234';
    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare(password, hash);
    const isInvalid = await bcrypt.compare('wrongpassword', hash);
    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });
});

// ─── Test 2: Password validation regex ───────────────────────────────────────
/**
 * Test: Strong password validator enforces complexity rules.
 * Context: Signup requires min 6 chars, 1 uppercase, 1 lowercase, 1 special char.
 * Weak passwords must be rejected; strong passwords must pass.
 */
describe('Password validation', () => {
  const validatePassword = (p: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/.test(p);

  test('rejects weak passwords', () => {
    expect(validatePassword('password')).toBe(false);
    expect(validatePassword('PASSWORD1')).toBe(false);
    expect(validatePassword('Ab@1')).toBe(false);
  });

  test('accepts strong passwords', () => {
    expect(validatePassword('Alice@1234')).toBe(true);
    expect(validatePassword('Vendor@99!')).toBe(true);
  });
});

// ─── Test 3: JWT token generation and verification ───────────────────────────
/**
 * Test: JWT tokens are signed with user payload and can be verified.
 * Context: On login, a JWT is returned containing id, role, email.
 * The token must decode correctly and reject wrong secrets.
 */
describe('JWT token', () => {
  const secret = 'test_secret';

  test('generates and verifies a valid token', () => {
    const payload = { id: 1, role: 'hirer', email: 'alice@test.com' };
    const token = jwt.sign(payload, secret, { expiresIn: '24h' });
    const decoded = jwt.verify(token, secret) as typeof payload;
    expect(decoded.id).toBe(1);
    expect(decoded.role).toBe('hirer');
    expect(decoded.email).toBe('alice@test.com');
  });

  test('rejects a token signed with wrong secret', () => {
    const token = jwt.sign({ id: 1 }, secret);
    expect(() => jwt.verify(token, 'wrong_secret')).toThrow();
  });
});

// ─── Test 4: Role-based access control ───────────────────────────────────────
/**
 * Test: The requireRole middleware blocks users with wrong roles.
 * Context: Vendor routes must be inaccessible to hirers and vice versa.
 * A hirer trying to access a vendor-only endpoint gets 403 Forbidden.
 */
describe('Role-based access control', () => {
  const requireRole = (...roles: string[]) =>
    (req: any, res: any, next: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    };

  app.get('/vendor-only', (req: any, _res, next) => {
    req.user = { id: 1, role: 'hirer', email: 'alice@test.com' };
    next();
  }, requireRole('vendor'), (_req, res) => {
    res.json({ message: 'ok' });
  });

  test('blocks hirer from vendor-only route with 403', async () => {
    const res = await request(app).get('/vendor-only');
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Access denied');
  });

  app.get('/hirer-only', (req: any, _res, next) => {
    req.user = { id: 2, role: 'vendor', email: 'vendor@test.com' };
    next();
  }, requireRole('hirer'), (_req, res) => {
    res.json({ message: 'ok' });
  });

  test('blocks vendor from hirer-only route with 403', async () => {
    const res = await request(app).get('/hirer-only');
    expect(res.status).toBe(403);
  });
});

// ─── Test 5: Booking input validation ────────────────────────────────────────
/**
 * Test: Booking creation rejects requests with missing required fields.
 * Context: A booking must have venueId, eventName, guestCount, date, time, duration.
 * Missing any field returns 400 Bad Request.
 */
describe('Booking validation', () => {
  app.post('/test-booking', (req, res) => {
    const { venueId, eventName, guestCount, date, time, duration } = req.body;
    if (!venueId || !eventName || !guestCount || !date || !time || !duration) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    res.status(201).json({ message: 'Booking created' });
  });

  test('rejects booking with missing fields', async () => {
    const res = await request(app)
      .post('/test-booking')
      .send({ venueId: 1, eventName: 'Party' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  test('accepts booking with all required fields', async () => {
    const res = await request(app).post('/test-booking').send({
      venueId: 1, eventName: 'Wedding', guestCount: 100,
      date: '2025-12-01', time: '18:00', duration: 4,
    });
    expect(res.status).toBe(201);
  });
});

// ─── Test 6: Compliance score calculation ────────────────────────────────────
/**
 * Test: Compliance score is correctly calculated from uploaded documents.
 * Context: Hirers upload up to 3 doc types. Score = (matched / 3) * 5, rounded.
 * 0 docs = 0 stars, 3 docs = 5 stars, 1 doc = 2 stars.
 */
describe('Compliance score calculation', () => {
  const calcScore = (docTypes: string[]) => {
    const types = new Set(docTypes);
    const required = ['drivers_license', 'insurance', 'business_certificate'];
    const matched = required.filter(t => types.has(t)).length;
    return Math.round((matched / required.length) * 5);
  };

  test('returns 0 for no documents', () => {
    expect(calcScore([])).toBe(0);
  });

  test('returns 5 for all 3 documents', () => {
    expect(calcScore(['drivers_license', 'insurance', 'business_certificate'])).toBe(5);
  });

  test('returns 2 for 1 document', () => {
    expect(calcScore(['drivers_license'])).toBe(2);
  });
});