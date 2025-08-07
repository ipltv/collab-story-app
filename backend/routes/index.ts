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
