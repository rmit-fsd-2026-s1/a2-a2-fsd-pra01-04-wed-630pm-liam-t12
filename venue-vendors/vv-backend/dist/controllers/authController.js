"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const User_1 = require("../entity/User");
const userRepo = () => database_1.AppDataSource.getRepository(User_1.User);
const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/.test(password);
};
const signup = async (req, res) => {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }
    if (!['hirer', 'vendor'].includes(role)) {
        res.status(400).json({ message: 'Role must be hirer or vendor' });
        return;
    }
    if (!validatePassword(password)) {
        res.status(400).json({ message: 'Password must be at least 6 characters with 1 uppercase, 1 lowercase, and 1 special character' });
        return;
    }
    const existing = await userRepo().findOneBy({ email });
    if (existing) {
        res.status(409).json({ message: 'Email already registered' });
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = userRepo().create({ name, email, passwordHash, role, phone });
    await userRepo().save(user);
    res.status(201).json({ message: 'Account created successfully' });
};
exports.signup = signup;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    const user = await userRepo().findOneBy({ email });
    if (!user) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.json({
        token,
        user: {
            id: user.id, name: user.name, email: user.email,
            role: user.role, phone: user.phone,
            avatarUrl: user.avatarUrl, joinedAt: user.joinedAt,
        }
    });
};
exports.login = login;
const getProfile = async (req, res) => {
    const user = await userRepo().findOneBy({ id: req.user.id });
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    res.json({
        id: user.id, name: user.name, email: user.email,
        role: user.role, phone: user.phone,
        avatarUrl: user.avatarUrl, joinedAt: user.joinedAt,
    });
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    const { name, phone, avatarUrl } = req.body;
    const user = await userRepo().findOneBy({ id: req.user.id });
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    if (name)
        user.name = name;
    if (phone)
        user.phone = phone;
    if (avatarUrl !== undefined)
        user.avatarUrl = avatarUrl;
    await userRepo().save(user);
    res.json({ message: 'Profile updated', user });
};
exports.updateProfile = updateProfile;
