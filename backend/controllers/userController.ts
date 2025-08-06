import { type Request, type Response } from 'express';
import {
    getAllUsers,
    getUserById,
    getUserByUsername,
    createUser,
    updateUser,
    deleteUser
} from '../models/userModel.js';

export async function getAllUsersHandler(_req: Request, res: Response) {
    try {
        const users = await getAllUsers();
        return res.json(users);
    } catch {
        return res.status(500).json({ message: 'Failed to fetch users.' });
    }
}

export async function getUserByIdHandler(req: Request, res: Response) {
    const { id } = req.params;
    const userId = Number(id);
    if (isNaN(userId) || !id) {
        return res.status(400).json({ message: 'Invalid user ID provided.' });
    }
    try {
        const user = await getUserById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        return res.json(user);
    } catch {
        return res.status(500).json({ message: 'Failed to fetch user.' });
    }
}

export async function createUserHandler(req: Request, res: Response) {
    const { username, email, password_hash } = req.body;
    if (!username || !email || !password_hash) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const user = await createUser({ username, email, password: password_hash });
        return res.status(201).json(user);
    } catch {
        return res.status(500).json({ message: 'Failed to create user.' });
    }
}

export async function updateUserHandler(req: Request, res: Response) {
    const { id } = req.params;
    const userId = Number(id);
    const updateFields = req.body;
    if (!updateFields || Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: 'No fields to update.' });
    }
    if (updateFields.password) {
        return res.status(400).json({ message: 'Password cannot be updated directly.' });
    }
    if (isNaN(userId) || !id) {
        return res.status(400).json({ message: 'Invalid user ID provided.' });
    }
    try {
        const updated = await updateUser(userId, updateFields);
        return res.json(updated);
    } catch {
        return res.status(500).json({ message: 'Failed to update user.' });
    }
}

export async function deleteUserHandler(req: Request, res: Response) {
    const { id } = req.params;
    const userId = Number(id);
    if (isNaN(userId) || !id) {
        return res.status(400).json({ message: 'Invalid user ID provided.' });
    }
    try {
        await deleteUser(userId);
        return res.json({ message: 'User deleted successfully.' });
    } catch {
        return res.status(500).json({ message: 'Failed to delete user.' });
    }
}
export async function getUserByUsernameHandler(req: Request, res: Response) {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }
    try {
        const user = await getUserByUsername(username);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        return res.json(user);
    } catch {
        return res.status(500).json({ message: 'Failed to fetch user.' });
    }
}