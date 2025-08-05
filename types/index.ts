export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Story {
  id: number;
  title: string;
  content: string;
  author: User;
  contributors: User[];
}