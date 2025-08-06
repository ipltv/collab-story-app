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

export async function updateStory(id: number, story: Omit<Story, 'id'>): Promise<Story> {
    const updated = await db<Story>('stories')
        .where({ id })
        .update(story)
        .returning(['id', 'title', 'description', 'author_id', 'created_at']).first();

    if (!updated) {
        throw new Error('Failed to update story.');
    }

    return updated as Story;
}

export async function deleteStory(id: number): Promise<boolean> {
    const deleted = await db('stories').where({ id }).del();
    return deleted > 0;
}

export async function isUserStoryAuthorOrContributor(storyId: number, userId: number): Promise<boolean> {
    const story = await db('stories')
        .where({ id: storyId, author_id: userId })
        .first();

    if (story) return true;

    const contributor = await db('contributors')
        .where({ story_id: storyId, user_id: userId })
        .first();

    return Boolean(contributor);
}