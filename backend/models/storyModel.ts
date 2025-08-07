import db from '../db/index.js';
import type { StoryDB } from '../types/index.js';

export async function getAllStories(): Promise<StoryDB[]> {
    return db<StoryDB>('stories').select('id', 'title', 'description', 'created_by', 'created_at');
}

export async function getStoryById(id: number): Promise<StoryDB | undefined> {
    return db<StoryDB>('stories')
        .where({ id })
        .select('id', 'title', 'description', 'created_by', 'created_at')
        .first();
}

export async function createStory(data: Omit<StoryDB, 'id' | 'created_at' | 'updated_at'>): Promise<StoryDB> {
  const [created] = await db<StoryDB>('stories')
    .insert(data)
    .returning(['id', 'title', 'content', 'author_id', 'created_at', 'updated_at']);

  if (!created) {
    throw new Error('Failed to create story.');
  }

  return created as StoryDB;
}


export async function updateStory(id: number, story: Omit<StoryDB, 'id' | 'updated_at' | 'created_at' | 'author_id'>): Promise<StoryDB> {
    const updated = await db<StoryDB>('stories')
        .where({ id })
        .update(story)
        .returning(['id', 'title', 'description', 'author_id', 'created_at']).first();

    if (!updated) {
        throw new Error('Failed to update story.');
    }

    return updated as StoryDB;
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