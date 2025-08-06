import db from '../db/index.js';
import type { Story } from '../types/index.js';

export async function getAllStories(): Promise<Story[]> {
    return db<Story>('stories').select('id', 'title', 'description', 'created_by', 'created_at');
}

export async function getStoryById(id: number): Promise<Story | undefined> {
    return db<Story>('stories')
        .where({ id })
        .select('id', 'title', 'description', 'created_by', 'created_at')
        .first();
}

export async function createStory(data: Omit<Story, 'id' | 'created_at'>): Promise<Story> {
    // Returning specific fields is safer and more explicit.
    const [created] = await db<Story>('stories')
        .insert(data)
        .returning(['id', 'title', 'description', 'created_by', 'created_at']);

    if (!created) {
        throw new Error('Failed to create story.');
    }

    return created as Story;
}