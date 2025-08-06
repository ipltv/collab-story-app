import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

router.use('api/auth', authRoutes);
router.use('api/users', userRoutes);

export default router;
