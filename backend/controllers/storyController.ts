import { type Request, type Response } from 'express';
import {
    getAllStories,
    getStoryById,
    createStory,
    updateStory,
    deleteStory,
} from '../models/storyModel.js';

export async function getAllStoriesHandler(req: Request, res: Response) {
    try {
        const stories = await getAllStories();
        return res.json(stories);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch stories.' });
    }
}

export async function createStoryHandler(req: Request, res: Response) {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }

    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    try {
        const story = await createStory({
            title,
            content,
            created_by: req.user.id
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

    const { title, content } = req.body;
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
