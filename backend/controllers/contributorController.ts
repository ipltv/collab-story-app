import { type Request, type Response } from 'express';
import {
    getContributorsByStory,
    addContributor,
    removeContributor
} from '../models/collaboratorModel.js';
import { getStoryById } from '../models/storyModel.js';


export async function addContributorHandler(req: Request, res: Response) {
    const { story_id, contributor_id } = req.body;

    if (!story_id || !contributor_id) {
        return res.status(400).json({ message: 'story_id and user_id required.' });
    }
    console.log(`Adding contributor with user ID: ${contributor_id} to story ID: ${story_id}`);
    
    try {
        const contributor = await addContributor({ story_id, user_id: contributor_id });
        return res.status(201).json(contributor);
    } catch (error) {
        console.error('Error adding contributor:', error);
        return res.status(500).json({ message: 'Failed to add contributor.' });
    }
}

export async function getContributorsByStoryIdHandler(req: Request, res: Response) {
    const { id } = req.params;
    const storyId = Number(id);
    if (isNaN(storyId) || !id) {
        return res.status(400).json({ message: 'Invalid story ID provided.' });
    }

    try {
        const contributors = await getContributorsByStory(storyId);
        return res.json(contributors);
    } catch {
        return res.status(500).json({ message: 'Failed to fetch contributors.' });
    }
}

export async function deleteContributorHandler(req: Request, res: Response) {
    const { id } = req.params;
    const contributorId = Number(id);
    if (isNaN(contributorId) || !id) {
        return res.status(400).json({ message: 'Invalid story ID provided.' });
    }
    try {
        await removeContributor(contributorId);
        return res.json({ message: 'Contributor removed.' });
    } catch {
        return res.status(500).json({ message: 'Failed to remove contributor.' });
    }
}
