import { type Request, type Response } from 'express';
import {
    getAllStories,
    getStoryById,
    createStory,
    updateStory,
    deleteStory,
    isUserStoryAuthorOrContributor
} from '../models/storyModel.js';

export async function getStories(req: Request, res: Response) {
    try {
        const stories = await getAllStories();
        return res.json(stories);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch stories.' });
    }
}

export async function createNewStory(req: Request, res: Response) {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
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

export async function updateStoryById(req: Request, res: Response) {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!(await isUserStoryAuthorOrContributor(req.user.id, +id))) {
        return res.status(403).json({ message: 'Not authorized to update this story.' });
    }

    try {
        const updated = await updateStory(+id, { title, content });
        return res.json(updated);
    } catch {
        return res.status(500).json({ message: 'Failed to update story.' });
    }
}

export async function deleteStoryById(req: Request, res: Response) {
    const { id } = req.params;

    const story = await getStoryById(+id);
    if (!story || story.created_by !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this story.' });
    }

    try {
        await deleteStory(+id);
        return res.json({ message: 'Story deleted successfully.' });
    } catch {
        return res.status(500).json({ message: 'Failed to delete story.' });
    }
}
