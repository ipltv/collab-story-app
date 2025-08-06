import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUserHandler, getUserByUsername } from './userController.js';
import { createUser } from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;
const saltRounds = 10;

export async function register(req: Request, res: Response) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
        const user = await createUser({ username, email, password: hashedPassword });
        return res.status(201).json({ message: "User registered successfully.", user });
    } catch {
        return res.status(500).json({ message: "Registration failed." });
    }
}

export async function login(req: Request, res: Response) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required." });
    }

    const user = await getUserByUsername(username);
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        return res.status(401).json({ message: "Invalid credentials." });
    }

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    return res.json({ accessToken });
}

export async function logout(req: Request, res: Response) {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
    return res.json({ message: "Logged out successfully." });
}