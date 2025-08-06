import express from 'express';
import {
  register,
  login,
  logout,
} from '../controllers/authController.js';

import { refreshAccessToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login a user
router.post('/login', login);

// Logout (optional endpoint for client-side session clearing)
router.post('/logout', logout);

// Refresh access token using refresh token
router.get('/refresh', refreshAccessToken);

export default router;
