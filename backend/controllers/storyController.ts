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

    const { title, content } = req.body as unknown as CreateStoryBody;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }

    const author = await getUserById(req.user.id);
    if (!author) {
        return res.status(404).json({ message: 'Author not found.' });
    }

    try {
        const story = await createStory({
            title,
            content,
            author_id: author.id,
        });
        return res.status(201).json(story);
    } catch {
        return res.status(500).json({ message: 'Failed to create story.' });
    }
}

export async function updateStoryHandler(req: Request, res: Response) {
    const { id } = req.params;
    const storyId = Number(id);
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
    } catch {
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
