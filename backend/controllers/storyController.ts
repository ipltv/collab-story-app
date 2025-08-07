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