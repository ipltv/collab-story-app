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
