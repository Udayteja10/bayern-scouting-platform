import express, { Request, Response } from 'express';
import { User } from '../models/index';

const router = express.Router();

// Simulated signing of JWT tokens for developer simplicity
// Frontend will use this token in the Authorization header
const generateToken = (user: User) => {
  // Return a mock base64 token representing the user JSON
  const payload = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role
  };
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  return token;
};

/**
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // In local development, we allow simple matching or passwordHash check.
    // For this local app, let's accept password match if password matches passwordHash or simple bypass
    // We'll write the hashed password as plain text in the seed script for developer simplicity.
    if (user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      accessToken: token,
      refreshToken: 'mock-refresh-token-' + user.id,
      tokenType: 'Bearer',
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      expiresIn: 86400000 // 24 hours
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const user = await User.create({
      email,
      passwordHash: password, // Plain text in local dev for convenience
      fullName,
      role: role || 'RECRUITMENT_ANALYST'
    });

    const token = generateToken(user);

    res.status(201).json({
      accessToken: token,
      refreshToken: 'mock-refresh-token-' + user.id,
      tokenType: 'Bearer',
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      expiresIn: 86400000
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/refresh
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }

    // Extract user ID from mock-refresh-token-{userId}
    const userIdStr = refreshToken.replace('mock-refresh-token-', '');
    const userId = Number(userIdStr);

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const token = generateToken(user);
    res.json({
      accessToken: token
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
