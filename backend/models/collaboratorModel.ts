import db from '../db/index.js';
import type { Contributor } from '../types/index.js';

export async function getContributorsByStory(storyId: number): Promise<Contributor[]> {
    return db<Contributor>('contributors')
        .where({ story_id: storyId })
        .select('id', 'story_id', 'user_id');
}

export async function addContributor(data: Omit<Contributor, 'id' | 'added_at'>): Promise<Contributor> {
    const [created] = await db<Contributor>('contributors')
        .insert(data)
        .returning(['id', 'story_id', 'user_id']);

    if (!created) {
        throw new Error('Failed to add contributor.');
    }
    return created as Contributor;
}