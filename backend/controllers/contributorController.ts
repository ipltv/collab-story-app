import { type Request, type Response } from 'express';
import {
    getContributorsByStory,
    addContributor,
    removeContributor
} from '../models/collaboratorModel.js';
import { getStoryById } from '../models/storyModel.js';

export async function addStoryContributor(req: Request, res: Response) {
    const { story_id, user_id } = req.body;

    if (!story_id || !user_id) {
        return res.status(400).json({ message: 'story_id and user_id required.' });
    }

    const story = await getStoryById(story_id);
    if (!story || story.created_by !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to add contributors to this story.' });
    }

    try {
        const contributor = await addContributor({ story_id, user_id });
        return res.status(201).json(contributor);
    } catch {
        return res.status(500).json({ message: 'Failed to add contributor.' });
    }
}

export async function getContributors(req: Request, res: Response) {
    const { story_id } = req.params;

    try {
        const contributors = await getContributorsByStory(+story_id);
        return res.json(contributors);
    } catch {
        return res.status(500).json({ message: 'Failed to fetch contributors.' });
    }
}

export async function removeStoryContributor(req: Request, res: Response) {
    const { id } = req.params;

    try {
        // You may add check for story author
        await removeContributor(+id);
        return res.json({ message: 'Contributor removed.' });
    } catch {
        return res.status(500).json({ message: 'Failed to remove contributor.' });
    }
}
