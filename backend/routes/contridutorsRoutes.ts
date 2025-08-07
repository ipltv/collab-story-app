import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addContributorHandler,
  getContributorsByStoryIdHandler,
  deleteContributorHandler
} from '../controllers/contributorController.js';
import { isAuthor } from 'middleware/storyPermissionMiddleware.js';

const router = Router();

// POST /contributors — add a contributor
router.post('/', protect, isAuthor, addContributorHandler);

// GET /contributors/:story_id — get all contributors for a story
router.get('/:story_id', protect, getContributorsByStoryIdHandler);

// DELETE /contributors/:id — remove contributor by ID
router.delete('/:id', protect, isAuthor, deleteContributorHandler);

export default router;
