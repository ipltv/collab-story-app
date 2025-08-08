// THIS IS BACKEND CODE
import dotenv from 'dotenv';
import e from 'express';

// Load environment variables from the appropriate .env file.
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

// A list of all required environment variables.
const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'ORIGIN_URL', 'PORT', 'NODE_ENV'] as const;

// Check if each required variable is defined.
for (const key of requiredVars) {
  if (!process.env[key]) {
    console.error(`Environment variable ${key} is not defined!`);
    // Exit the process if a required variable is missing.
    process.exit(1);
  }
}

// Export the environment variables for use in other files.
// We use type assertions to tell TypeScript that these values exist.
export const DATABASE_URL = process.env.DATABASE_URL as string; // Database connection string
export const JWT_SECRET = process.env.JWT_SECRET as string; // JWT secret for signing tokens
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string; // JWT secret for signing refresh tokens
export const ORIGIN_URL = process.env.ORIGIN_URL as string; //Origin URL for CORS
export const PORT = process.env.PORT as string; // Port on which the backend server will run
export const NODE_ENV = process.env.NODE_ENV as string; // Environment mode (development, production)

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

import { type Request, type Response } from 'express';
import {
    getContributorsByStory,
    addContributor,
    removeContributor
} from '../models/collaboratorModel.js';
import { getStoryById } from '../models/storyModel.js';


export async function addContributorHandler(req: Request, res: Response) {
    const { story_id, contributor_id } = req.body;

    if (!story_id || !contributor_id) {
        return res.status(400).json({ message: 'story_id and user_id required.' });
    }
    console.log(`Adding contributor with user ID: ${contributor_id} to story ID: ${story_id}`);
    
    try {
        const contributor = await addContributor({ story_id, user_id: contributor_id });
        return res.status(201).json(contributor);
    } catch (error) {
        console.error('Error adding contributor:', error);
        return res.status(500).json({ message: 'Failed to add contributor.' });
    }
}

export async function getContributorsByStoryIdHandler(req: Request, res: Response) {
    const { id } = req.params;
    const storyId = Number(id);
    if (isNaN(storyId) || !id) {
        return res.status(400).json({ message: 'Invalid story ID provided.' });
    }

    try {
        const contributors = await getContributorsByStory(storyId);
        return res.json(contributors);
    } catch {
        return res.status(500).json({ message: 'Failed to fetch contributors.' });
    }
}

export async function deleteContributorHandler(req: Request, res: Response) {
    const { id } = req.params;
    const contributorId = Number(id);
    if (isNaN(contributorId) || !id) {
        return res.status(400).json({ message: 'Invalid story ID provided.' });
    }
    try {
        await removeContributor(contributorId);
        return res.json({ message: 'Contributor removed.' });
    } catch {
        return res.status(500).json({ message: 'Failed to remove contributor.' });
    }
}

import { type Request, type Response } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';
import {
    getAllStories,
    getStoryById,
    createStory,
    updateStory,
    deleteStory,
} from '../models/storyModel.js';
import { getUserById } from 'models/userModel.js';
import type { CreateStoryBody } from '../types/index.js';
import { log } from 'console';

export async function getAllStoriesHandler(req: Request, res: Response) {
    try {
        const stories = await getAllStories();
        return res.json(stories);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch stories.' });
    }
}

export async function createStoryHandler(req: AuthenticatedRequest, res: Response) {
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: 'Invalid request body.' });
    }

    const { title, content } = req.body as CreateStoryBody;
    
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }

    const user = req.user;
    if (!user || !user.id) {
        return res.status(401).json({ message: 'Unauthorized: no user ID found' });
    }

    try {
        const story = await createStory({
            title,
            content,
            author_id: user.id, 
        });
        return res.status(201).json(story);
    } catch (e) {
        log('Error creating story:', e);
        return res.status(500).json({ message: 'Failed to create story.' });
    }
}

export async function updateStoryHandler(req: Request, res: Response) {
    const { id } = req.params;
    const storyId = Number(id);
    console.log(`Updating story with ID: ${storyId}`);
    
    if (isNaN(storyId) || !id) {
        return res.status(400).json({ message: 'Invalid story ID provided.' });
    }
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: 'Invalid request body.' });
    }

    const { title, content } = req.body as unknown as CreateStoryBody;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }

    try {
        const updated = await updateStory(storyId, { title, content });
        return res.json(updated);
    } catch (error) {
        log('Error updating story:', error);
        return res.status(500).json({ message: 'Failed to update story.' });
    }
}

export async function deleteStoryHandler(req: Request, res: Response) {
    const { id } = req.params;
    const storyId = Number(id);
    if (isNaN(storyId) || !id) {
        return res.status(400).json({ message: 'Invalid story ID provided.' });
    }

    const story = await getStoryById(storyId);

    try {
        await deleteStory(+id);
        return res.json({ message: 'Story deleted successfully.' });
    } catch {
        return res.status(500).json({ message: 'Failed to delete story.' });
    }
}

export async function getMyStoriesHandler(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;

    try {
        const stories = await getAllStories();
        const userStories = stories.filter(story => story.author_id === userId);
        return res.json(userStories);
    } catch (error) {
        log('Error fetching user stories:', error);
        return res.status(500).json({ message: 'Failed to fetch user stories.' });
    }
}

import { type Request, type Response } from 'express';
import {
    getAllUsers,
    getUserById,
    getUserByUsername,
    createUser,
    updateUser,
    deleteUser
} from '../models/userModel.js';

export async function getAllUsersHandler(_req: Request, res: Response) {
    try {
        const users = await getAllUsers();
        return res.json(users);
    } catch {
        return res.status(500).json({ message: 'Failed to fetch users.' });
    }
}

export async function getUserByIdHandler(req: Request, res: Response) {
    const { id } = req.params;
    const userId = Number(id);
    if (isNaN(userId) || !id) {
        return res.status(400).json({ message: 'Invalid user ID provided.' });
    }
    try {
        const user = await getUserById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        return res.json(user);
    } catch {
        return res.status(500).json({ message: 'Failed to fetch user.' });
    }
}

export async function createUserHandler(req: Request, res: Response) {
    const { username, email, password_hash } = req.body;
    if (!username || !email || !password_hash) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const user = await createUser({ username, email, password_hash });
        return res.status(201).json(user);
    } catch {
        return res.status(500).json({ message: 'Failed to create user.' });
    }
}

export async function updateUserHandler(req: Request, res: Response) {
    const { id } = req.params;
    const userId = Number(id);
    const updateFields = req.body;
    if (!updateFields || Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: 'No fields to update.' });
    }
    if (updateFields.id) {
        return res.status(400).json({ message: 'User ID cannot be changed.' });
    }
    if (updateFields.password) {
        return res.status(400).json({ message: 'Password cannot be updated directly.' });
    }
    if (isNaN(userId) || !id) {
        return res.status(400).json({ message: 'Invalid user ID provided.' });
    }
    try {
        const updated = await updateUser(userId, updateFields);
        return res.json(updated);
    } catch {
        return res.status(500).json({ message: 'Failed to update user.' });
    }
}

export async function deleteUserHandler(req: Request, res: Response) {
    const { id } = req.params;
    const userId = Number(id);
    if (isNaN(userId) || !id) {
        return res.status(400).json({ message: 'Invalid user ID provided.' });
    }
    try {
        await deleteUser(userId);
        return res.json({ message: 'User deleted successfully.' });
    } catch {
        return res.status(500).json({ message: 'Failed to delete user.' });
    }
}
export async function getUserByUsernameHandler(req: Request, res: Response) {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }
    try {
        const user = await getUserByUsername(username);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        return res.json(user);
    } catch {
        return res.status(500).json({ message: 'Failed to fetch user.' });
    }
}

import knex from 'knex';
import { DATABASE_URL } from '../config/env.js';

const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
});

export default db;

import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET,  JWT_REFRESH_SECRET } from 'config/env.js';
import { log } from 'console';
import type { AuthenticatedRequest } from 'types/index.js';

// Extend Express Request interface to include 'user'
declare global {
    namespace Express {
        interface Request {
            user?: { id: number };
        }
    }
}

interface JwtPayload {
    userId: number;
}

export function protect(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized. Missing token.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token || !JWT_SECRET) {
        return res.status(401).json({ message: 'Unauthorized. Missing token or secret.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
        (req as AuthenticatedRequest).user = { id: decoded.userId };
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
}

// for refreshing access tokens
export function refreshAccessToken(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken || !JWT_SECRET || !JWT_REFRESH_SECRET) {
        return res.status(401).json({ message: 'No refresh token provided or missing secret.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;
        const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '15m' });

        return res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token.' });
    }
}

import { type Request, type Response, type NextFunction } from 'express';
import { getStoryById, isUserStoryAuthorOrContributor } from '../models/storyModel.js';

function getStoryIdFromRequest(req: Request): number | null {
    const possibleFields = ['id', 'story_id', 'storyId'];

    for (const field of possibleFields) {
        const fromParams = req.params?.[field];
        const fromBody = req.body?.[field];
        const fromQuery = req.query?.[field];

        const value = fromParams || fromBody || fromQuery;

        if (value !== undefined) {
            const storyId = Number(value);
            if (!isNaN(storyId)) {
                return storyId;
            }
        }
    }

    return null;
}

export async function isAuthorOrContributor(req: Request, res: Response, next: NextFunction) {
    try {
        const storyId = getStoryIdFromRequest(req);
        const userId = req.user?.id;
        console.log(`Checking permissions for user ID: ${userId} on story ID: ${storyId}`);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: no user ID found' });
        }

        if (!storyId) {
            return res.status(400).json({ error: 'Bad Request: story ID is required' });
        }

        const story = await getStoryById(storyId);

        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }
        // Check if the user is either the author or a contributor of the story
        const isAuthorOrContributor = isUserStoryAuthorOrContributor(storyId, userId);
        if (!isAuthorOrContributor) {
            return res.status(403).json({ error: 'Forbidden: access denied' });
        }

        next();
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function isAuthor(req: Request, res: Response, next: NextFunction) {
    try {
        const storyId = getStoryIdFromRequest(req);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: no user ID found' });
        }

        if (!storyId) {
            return res.status(400).json({ error: 'Bad Request: story ID is required' });
        }

        const story = await getStoryById(storyId);

        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        if (story.author_id !== userId) {
            return res.status(403).json({ error: 'Forbidden: access denied' });
        }

        next();
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

import db from '../db/index.js';
import type { Contributor } from '../types/index.js';

export async function getContributorsByStory(storyId: number): Promise<Contributor[]> {
    return db<Contributor>('contributors')
        .where({ story_id: storyId })
        .select('id', 'story_id', 'user_id');
}

export async function addContributor(data: Omit<Contributor, 'id' | 'added_at'>): Promise<Contributor> {
    const [created] = await db<Contributor>('contributors')
        .insert(data)
        .returning(['id', 'story_id', 'user_id']);

    if (!created) {
        throw new Error('Failed to add contributor.');
    }
    return created as Contributor;
}

export async function removeContributor(id: number): Promise<void> {
    const deleted = await db('contributors').where({ id }).del();
    if (deleted === 0) {
        throw new Error('Failed to remove contributor.');
    }
}

import db from '../db/index.js';
import type { StoryDB } from '../types/index.js';

export async function getAllStories(): Promise<StoryDB[]> {
    return db<StoryDB>('stories').select('id', 'title', 'content', 'author_id', 'created_at', 'updated_at');
}

export async function getStoryById(id: number): Promise<StoryDB | undefined> {
    return db<StoryDB>('stories')
        .where({ id })
        .select('id', 'title', 'content', 'author_id', 'created_at', 'updated_at')
        .first();
}

export async function createStory(data: Omit<StoryDB, 'id' | 'created_at' | 'updated_at'>): Promise<StoryDB> {
    const [created] = await db<StoryDB>('stories')
        .insert(data)
        .returning(['id', 'title', 'content', 'author_id', 'created_at', 'updated_at']);

    if (!created) {
        throw new Error('Failed to create story.');
    }

    return created as StoryDB;
}


export async function updateStory(id: number, story: Omit<StoryDB, 'id' |  'author_id' | 'updated_at' | 'created_at' >): Promise<StoryDB> {
    const updatedRows = await db<StoryDB>('stories')
        .where({ id })
        .update(story)
        .returning(['id', 'title', 'content', 'author_id', 'created_at', 'updated_at']);

    const updated = updatedRows[0];

    if (!updated) {
        throw new Error('Failed to update story.');
    }

    return updated;
}

export async function deleteStory(id: number): Promise<boolean> {
    const deleted = await db('stories').where({ id }).del();
    return deleted > 0;
}

export async function isUserStoryAuthorOrContributor(storyId: number, userId: number): Promise<boolean> {
    const story = await db('stories')
        .where({ id: storyId, author_id: userId })
        .first();

    if (story) return true;

    const contributor = await db('contributors')
        .where({ story_id: storyId, user_id: userId })
        .first();

    return Boolean(contributor);
}

export async function getStoriesByAuthor(authorId: number): Promise<StoryDB[]> {
    return db<StoryDB>('stories')
        .where({ author_id: authorId })
        .select('id', 'title', 'content', 'author_id', 'created_at', 'updated_at');
}

import { log } from 'console';
import db from '../db/index.js';
import type { UserWithPassword, User } from '../types/index.js';

export async function getAllUsers(): Promise<User[]> {
    // It's a good security practice to NEVER select the password hash
    // unless explicitly needed for authentication.
    return db<User>('users').select('id', 'username', 'email');
}

export async function getUserById(id: number): Promise<User | undefined> {
    // Same security consideration: do not return the password hash.
    return db<User>('users').where({ id }).select('id', 'username', 'email').first();
}

export async function getUserByUsername(username: string): Promise<UserWithPassword | undefined> {
    // This function is used for login, so returning the password hash is necessary here.
    return db<UserWithPassword>('users').where({ username }).first();
}

export async function createUser(user: Omit<UserWithPassword, 'id'>): Promise<User> {
    // We insert all fields, but only return non-sensitive data for security reasons.
    const [created] = await db<UserWithPassword>('users')
        .insert(user)
        .returning(['id', 'username', 'email']);
    console.log("User created:", created);
    if (!created) {
        throw new Error('Failed to create user.');
    }
    return created as User;
}

export async function updateUser(id: number, fields: Partial<User>): Promise<User> {
    const [updated] = await db<User>('users')
        .where({ id })
        .update(fields)
        .returning(['id', 'username', 'email']);
    if (!updated) throw new Error('Failed to update user.');
    return updated;
}

export async function deleteUser(id: number): Promise<void> {
    const deleted = await db('users').where({ id }).del();
    if (!deleted) throw new Error('User not found or not deleted.');
}

import express from 'express';
import {
  register,
  login,
  logout,
  getMeProfile
} from '../controllers/authController.js';

import { refreshAccessToken, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login a user
router.post('/login', login);

// Logout (optional endpoint for client-side session clearing)
router.post('/logout', logout);

// Refresh access token using refresh token
router.get('/refresh', refreshAccessToken);

// Get current user profile
router.get('/me', protect, getMeProfile);

export default router;

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addContributorHandler,
  getContributorsByStoryIdHandler,
  deleteContributorHandler
} from '../controllers/contributorController.js';
import { isAuthor } from 'middleware/storyPermissionMiddleware.js';

const router = Router();

// POST /contributors/ add a contributor to a story with
router.post('/', protect, isAuthor, addContributorHandler);

// GET /contributors/:id — get all contributors for a story
router.get('/:id', protect, getContributorsByStoryIdHandler);

// DELETE /contributors/:id — remove contributor by ID
router.delete('/:id', protect, isAuthor, deleteContributorHandler);

export default router;

import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import storiesRouter from './storiesRoutes.js';
import contributorsRouter from './contridutorsRoutes.js';

const router = express.Router();

router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/stories', storiesRouter);
router.use('/api/contributors', contributorsRouter);

export default router;


import express from 'express';
import {
  getAllStoriesHandler,
  createStoryHandler,
  updateStoryHandler,
  deleteStoryHandler,
  getMyStoriesHandler,
} from '../controllers/storyController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  isAuthorOrContributor,
  isAuthor,
} from '../middleware/storyPermissionMiddleware.js';

const router = express.Router();

// GET /stories - get all stories (requires auth)
router.get('/', protect, getAllStoriesHandler);

// POST /stories - create a story (requires auth)
router.post('/', protect, createStoryHandler);

// PATCH /stories/:id - update story (requires auth + author or contributor)
router.patch('/:id', protect, isAuthorOrContributor, updateStoryHandler);

// DELETE /stories/:id - delete story (requires auth + only author)
router.delete('/:id', protect, isAuthor, deleteStoryHandler);

// GET /stories/my - get stories created by the authenticated user
router.get('/my', protect, getMyStoriesHandler);


export default router;

import express from 'express';
import {
    getAllUsersHandler,
    getUserByIdHandler,
    updateUserHandler,
    deleteUserHandler
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllUsersHandler);
router.get('/:id', protect, getUserByIdHandler);
router.patch('/:id', protect, updateUserHandler);
router.delete('/:id', protect, deleteUserHandler);

export default router;

import type { Request as ExpressRequest } from 'express';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface Contributor {
  id: number; // Unique identifier for the contributor
  story_id: number; // ID of the story the contributor
  user_id: number; // ID of the user who is a contributor
}

export interface StoryDB {
  id: number;
  title: string;
  content: string;
  author_id: number;
  created_at: Date;
  updated_at: Date;
}


export interface StoryWithAuthor extends Omit<StoryDB, 'created_by'> {
  author: User;
}

export interface CreateStoryBody {
  id: number; // ID of the user creating the story
  title: string;
  content: string;
}


export interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    id: number;
  };
}

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { PORT, ORIGIN_URL } from './config/env.js';

import router from './routes/index.js';

const corsOptions = {
    origin: ORIGIN_URL,
}

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(router);

const server = createServer(app);
const io = new SocketIOServer(server);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

//knexfile.cjs
console.log('Knexfile is being executed');
const path = require("path");

console.log(path.join(__dirname, "./config/migrations"));
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';


const config = {
  development: {
    client: "pg",
    connection: DATABASE_URL,
    migrations: {
      directory: path.join(__dirname, "./config/migrations"),
      tableName: "knex_migrations",
    },
    seeds: {
      directory: path.join(__dirname, "./config/seeds"),
    },
  },
  production: {
    client: "pg",
    connection: DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, "./config/migrations"),
      tableName: "knex_migrations",
    },
    seeds: {
      directory: path.join(__dirname, "./config/seeds"),
    },
  },
  test: {
    client: "pg",
    connection: DATABASE_URL,
    migrations: {
      directory: path.join(__dirname, "./config/migrations"),
      tableName: "knex_migrations",
    },
    seeds: {
      directory: path.join(__dirname, "./config/seeds"),
    }
  },
};

module.exports = config[NODE_ENV] || config.development;

// THIS IS FRONTEND CODE
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../store/store';
import { addStory } from '../store/storySlice';

export default function AddStoryForm() {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.story);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); 

    const handleAddStory = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            dispatch(addStory({ title, content })); 
            setTitle('');
            setContent('');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
                Add a New Story
            </h3>
            <form onSubmit={handleAddStory} className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter new story title"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    required
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write the story content here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 resize-none"
                    rows={4}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                        loading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                >
                    {loading ? 'Adding...' : 'Add Story'}
                </button>
            </form>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../store/userSlice';
import { type AppDispatch, type RootState } from '../store/store';

export default function LoginPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.user);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        dispatch(loginUser({ username, password }));
    };

    useEffect(() => {
        dispatch(clearError());
        if (isAuthenticated) {
            navigate('/stories');
        }
    }, [isAuthenticated, navigate, dispatch]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg border border-gray-200 transform transition-all duration-300 hover:scale-105">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Login
                </h2>
                <div className="space-y-4">
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && (
                    <p className="text-red-500 text-sm text-center mt-4">
                        {error}
                    </p>
                )}
                <button
                    className={`w-full mt-6 py-3 px-4 rounded-lg text-white font-semibold transition-all duration-300 ${
                        loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <div className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-600 hover:underline font-medium">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
}
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../store/userSlice";
import { type AppDispatch, type RootState } from "../store/store";

export default function RegisterPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.user);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!validateEmail(email)) {
            setLocalError("Please enter a valid email address.");
            return;
        }

        dispatch(registerUser({ username, email, password }));
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/stories');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg border border-gray-200 transform transition-all duration-300 hover:scale-105">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Creatre account
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error || localError && (
                        <p className="text-red-500 text-sm text-center">
                            {error || localError}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full mt-6 py-3 px-4 rounded-lg text-white font-semibold transition-all duration-300 ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                            } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
                    >
                        {loading ? 'Creating...' : 'Register'}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-600">
                    Do you already have an account?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Sing in
                    </Link>
                </div>
            </div>
        </div>
    );
}

import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';

export default function StoryDetails() {
    const { currentStory } = useSelector((state: RootState) => state.story);

    if (!currentStory) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-500">
                <span className="text-lg">Select a story to view its content.</span>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-3xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                {currentStory.title}
            </h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {currentStory.content}
            </div>
        </div>
    );
}

import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';
import { updateStoryContent } from '../store/storySlice';

export default function StoryEditor() {
  const currentStory = useSelector((state: RootState) => state.story.currentStory);
  const dispatch = useDispatch();

  if (!currentStory) return <div className="p-4">Select a story to edit.</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Editing: {currentStory.title}</h2>
      <textarea
        className="textarea textarea-bordered w-full"
        rows={10}
        value={currentStory.content}
        onChange={(e) => dispatch(updateStoryContent(e.target.value))}
      ></textarea>
    </div>
  );
}

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store/store';
import { setCurrentStory } from '../store/storySlice';
import AddStoryForm from './AddStoryForm';
import StoryDetails from './StoryDetails';
import { logoutUser } from '../store/userSlice';

export default function StoryList() {
    const { stories } = useSelector((state: RootState) => state.story);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };


    if (!Array.isArray(stories) || stories.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Your Stories</h2>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Logout
                    </button>
                </div>
                <div className="flex items-center justify-center p-4 text-gray-500 bg-gray-50 rounded-lg shadow-md border border-gray-200 mb-4">
                    <span className="text-sm">No stories found.</span>
                </div>
                <AddStoryForm />
            </div>
        );
    }

    return (
        <div className="flex gap-6 p-6">
            <div className="w-1/3 bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Your Stories</h2>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Logout
                    </button>
                </div>
                    <AddStoryForm />
                <ul className="space-y-3 mt-4">
                    {stories.map((story) => (
                        <li
                            key={story.id}
                            className="cursor-pointer p-4 bg-green-50 hover:bg-blue-100 transition-colors duration-200 ease-in-out rounded-lg shadow-sm border border-gray-200"
                            onClick={() => dispatch(setCurrentStory(story))}
                        >
                            <span className="text-base font-medium text-gray-700">
                                {story.title}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1">
                <StoryDetails />
            </div>
        </div>
    );
}

import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import storyReducer from './storySlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    story: storyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

interface Story {
    id: number;
    title: string;
    content: string;
    author: number;
    contributors: number[];
}

interface StoryState {
    stories: Story[];
    currentStory: Story | null;
    loading: boolean;
    error: string | null;
}

const initialState: StoryState = {
    stories: [],
    currentStory: null,
    loading: false,
    error: null,
};

export const fetchStories = createAsyncThunk(
    'story/fetchStories',
    async (_, thunkAPI) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            console.log(`Fetching stories with token: ${accessToken}`);

            const response = await axios.get(`${API_URL}/api/stories/my`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch stories');
        }
    }
);

export const addStory = createAsyncThunk(
    'story/addStory',
    async (storyData: { title: string; content: string }, thunkAPI) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axios.post(`${API_URL}/api/stories`, storyData, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to add new story');
        }
    }
);

const storySlice = createSlice({
    name: 'story',
    initialState,
    reducers: {
        setStories(state, action: PayloadAction<Story[]>) {
            state.stories = action.payload;
        },
        setCurrentStory(state, action: PayloadAction<Story>) {
            state.currentStory = action.payload;
        },
        updateStoryContent(state, action: PayloadAction<string>) {
            if (state.currentStory) {
                state.currentStory.content = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStories.fulfilled, (state, action: PayloadAction<Story[]>) => {
                state.stories = Array.isArray(action.payload) ? action.payload : [];
                state.loading = false;
            })
            .addCase(fetchStories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(addStory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addStory.fulfilled, (state, action: PayloadAction<Story>) => {
                state.stories.push(action.payload);
                state.loading = false;
            })
            .addCase(addStory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setStories, setCurrentStory, updateStoryContent } = storySlice.actions;
export default storySlice.reducer;



import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL;

interface User {
    id: number;
    username: string;
    email: string;
    stories: number[];
}

interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

export const setUserFromToken = createAsyncThunk(
    'user/setUserFromToken',
    async (token: string, thunkAPI) => {
        try {
            const response = await axios.get(`${API_URL}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
        }
    }
);

export const loginUser = createAsyncThunk(
    'user/loginUser',
    async (
        credentials: { username: string; password: string },
        thunkAPI
    ) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
            const accessToken = response.data.accessToken;
            localStorage.setItem('accessToken', accessToken);//ToDo: handle token storage securely
            await thunkAPI.dispatch(setUserFromToken(accessToken));
            return accessToken;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk(
    'user/registerUser',
    async (credentials: { username: string; email: string; password: string }, thunkAPI) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, credentials);
            const accessToken = response.data.accessToken;
            localStorage.setItem('accessToken', accessToken);
            await thunkAPI.dispatch(setUserFromToken(accessToken));
            return accessToken;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Registration failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'user/logoutUser',
    async (_, thunkAPI) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = Cookies.get('refreshToken');
            if (accessToken && refreshToken) {
                // Send logout request to server. 
                // Acctualy, server-side doen't expext payload for logout (only header), but we can send it for consistency and future use
                await axios.post(`${API_URL}/api/auth/logout`, { refreshToken }, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }

            localStorage.removeItem('accessToken');
            Cookies.remove('refreshToken');

            return true;
        } catch (err: any) {
            // Even if logout fails, we clear local state
            // This is important to ensure client-side state is consistent
            localStorage.removeItem('accessToken');
            Cookies.remove('refreshToken');
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Logout failed, but client state cleared');
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login(state, action: PayloadAction<User>) {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.error = null;
        },
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(setUserFromToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(setUserFromToken.fulfilled, (state, action: PayloadAction<User>) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.loading = false;
                state.error = null;
            })
            .addCase(setUserFromToken.rejected, (state, action) => {
                if (action.payload === "Invalid or expired token.") {
                    state.loading = false;
                    state.isAuthenticated = false;
                    state.error = null;
                } else {
                    state.loading = false;
                    state.isAuthenticated = false;
                    state.error = action.payload as string;
                }
            });
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            });
    },
});

export const { login, logout, clearError } = userSlice.actions;
export default userSlice.reducer;


import { useEffect } from 'react';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { RootState, AppDispatch } from './store/store';
import { fetchStories } from './store/storySlice';
import { setUserFromToken } from './store/userSlice';
import StoryList from './components/StoryList';
import LoginPage from './components/LoginPage';
import StoryEditor from './components/StoryEditor';
import RegisterPage from './components/RegisterPage';

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(setUserFromToken(token));
    }
    dispatch(fetchStories());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={user ? <StoryList /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/stories/:id"
          element={user ? <StoryEditor /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store/store';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)

@import "tailwindcss";
