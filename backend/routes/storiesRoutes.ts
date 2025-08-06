import express from 'express';
import {
  getAllStoriesHandler,
  createStoryHandler,
  updateStoryHandler,
  deleteStoryHandler,
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

export default router;
