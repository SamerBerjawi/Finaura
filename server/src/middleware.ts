// FIX: Changed express import to a namespace to avoid type conflicts with global DOM types.
import * as express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// FIX: Extended express.Request to ensure correct type properties.
export interface AuthRequest extends express.Request {
    user?: any;
}

export const authMiddleware = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

export const adminMiddleware = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    if (req.user.role !== 'Administrator') {
        return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
    next();
};