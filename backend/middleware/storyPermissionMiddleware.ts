import { type Request, type Response, type NextFunction } from 'express';
import { getStoryById, isUserStoryAuthorOrContributor } from '../models/storyModel.js';

export async function isAuthorOrContributor(req: Request, res: Response, next: NextFunction) {
    try {
        const storyId = Number(req.params.id);
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
        const storyId = Number(req.params.id);
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

        if (story.author.id !== userId) {
            return res.status(403).json({ error: 'Forbidden: access denied' });
        }

        next();
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
