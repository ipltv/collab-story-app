export interface User {
  id: number;
  username: string;
  email: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface Contributor {
  id: number; // Unique identifier for the contributor
  story_id: number; // ID of the story the contributor
  user_id: number; // ID of the user who is a contributor
}

export interface StoryDB {
  id: number;
  title: string;
  content: string;
  author_id: number;
  created_at: Date;
  updated_at: Date;
}


export interface StoryWithAuthor extends Omit<StoryDB, 'created_by'> {
  author: User;
}

export interface CreateStoryBody {
    title: string;
    content: string;
}

export interface AuthenticatedRequest extends Request {
  user: User;

}