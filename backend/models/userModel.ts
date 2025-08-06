import db from '../db/index.js';
import type { UserWithPassword, User } from '../types/index.js';

export async function getAllUsers(): Promise<User[]> {
    // It's a good security practice to NEVER select the password hash
    // unless explicitly needed for authentication.
    return db<User>('users').select('id', 'username', 'email');
}

export async function getUserById(id: number): Promise<User | undefined> {
    // Same security consideration: do not return the password hash.
    return db<User>('users').where({ id }).select('id', 'username', 'email').first();
}

export async function getUserByUsername(username: string): Promise<UserWithPassword | undefined> {
    // This function is used for login, so returning the password hash is necessary here.
    return db<UserWithPassword>('users').where({ username }).first();
}

export async function createUser(user: Omit<UserWithPassword, 'id'>): Promise<User> {
    // We insert all fields, but only return non-sensitive data for security reasons.
    const [created] = await db<UserWithPassword>('users')
        .insert(user)
        .returning(['id', 'username', 'email']);
    if (!created) {
        throw new Error('Failed to create user.');
    }
    return created as User;
}

export async function updateUser(id: number, fields: Partial<User>): Promise<User> {
    const [updated] = await db<User>('users')
        .where({ id })
        .update(fields)
        .returning(['id', 'username', 'email']);
    if (!updated) throw new Error('Failed to update user.');
    return updated;
}

export async function deleteUser(id: number): Promise<void> {
    const deleted = await db('users').where({ id }).del();
    if (!deleted) throw new Error('User not found or not deleted.');
}