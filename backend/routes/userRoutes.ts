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
