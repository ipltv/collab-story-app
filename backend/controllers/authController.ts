import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, getUserById, getUserByUsername } from '../models/userModel.js';
import { JWT_SECRET, JWT_REFRESH_SECRET } from 'config/env.js';
import { getStoriesByAuthor } from '../models/storyModel.js';


const saltRounds = 10;

export async function register(req: Request, res: Response) {
    console.log("Registering user:", req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
        const user = await createUser({ username: normalizedUsername, email: normalizedEmail, password_hash: hashedPassword });
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
    const normalizedUsername = username.trim().toLowerCase();

    const user = await getUserByUsername(normalizedUsername);
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        return res.status(401).json({ message: "Invalid credentials." });
    }
    // Generate access and refresh tokens    
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

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

// Returns the current user's profile and their stories
export async function getMeProfile(req: Request, res: Response) {
    const id = req.user?.id; // User is set by auth middleware
    const userId = Number(id);
    try {
        const user = await getUserById(userId);
        const stories = await getStoriesByAuthor(userId);
        const storiesIds = stories.map(story => story.id);
        const userProfile = { ...user, stories: storiesIds };
        return res.json(userProfile);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user profile." });
        return;
    }
}