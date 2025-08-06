import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include 'user'
declare global {
    namespace Express {
        interface Request {
            user?: { id: number };
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET;

interface JwtPayload {
    userId: number;
}

export function protect(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized. Missing token.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token || !JWT_SECRET) {
        return res.status(401).json({ message: 'Unauthorized. Missing token or secret.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
}

// for refreshing access tokens
export function refreshAccessToken(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    const REFRESH_SECRET = process.env.REFRESH_SECRET!;

    if (!refreshToken || !JWT_SECRET || !REFRESH_SECRET) {
        return res.status(401).json({ message: 'No refresh token provided or missing secret.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as JwtPayload;
        const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '15m' });

        return res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token.' });
    }
}
