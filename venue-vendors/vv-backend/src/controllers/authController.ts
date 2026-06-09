import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { AuthRequest } from '../middleware/auth';

const userRepo = () => AppDataSource.getRepository(User);

const validatePassword = (password: string): boolean => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/.test(password);
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ message: 'All fields are required' }); return;
  }
  if (!['hirer', 'vendor'].includes(role)) {
    res.status(400).json({ message: 'Role must be hirer or vendor' }); return;
  }
  if (!validatePassword(password)) {
    res.status(400).json({ message: 'Password must be at least 6 characters with 1 uppercase, 1 lowercase, and 1 special character' }); return;
  }
  const existing = await userRepo().findOneBy({ email });
  if (existing) {
    res.status(409).json({ message: 'Email already registered' }); return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = userRepo().create({ name, email, passwordHash, role, phone });
  await userRepo().save(user);
  res.status(201).json({ message: 'Account created successfully' });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' }); return;
  }
  const user = await userRepo().findOneBy({ email });
  if (!user) {
    res.status(401).json({ message: 'Invalid email or password' }); return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: 'Invalid email or password' }); return;
  }
  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  );
  res.json({
    token,
    user: {
      id: user.id, name: user.name, email: user.email,
      role: user.role, phone: user.phone,
      avatarUrl: user.avatarUrl, joinedAt: user.joinedAt,
    }
  });
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await userRepo().findOneBy({ id: req.user!.id });
  if (!user) { res.status(404).json({ message: 'User not found' }); return; }
  res.json({
    id: user.id, name: user.name, email: user.email,
    role: user.role, phone: user.phone,
    avatarUrl: user.avatarUrl, joinedAt: user.joinedAt,
  });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone, avatarUrl } = req.body;
  const user = await userRepo().findOneBy({ id: req.user!.id });
  if (!user) { res.status(404).json({ message: 'User not found' }); return; }
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  await userRepo().save(user);
  res.json({ message: 'Profile updated', user });
};