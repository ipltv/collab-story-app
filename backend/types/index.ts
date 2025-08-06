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

export interface Story {
  id: number;
  title: string;
  content: string;
  author: User;
  created_at: Date;
  updated_at: Date;
}