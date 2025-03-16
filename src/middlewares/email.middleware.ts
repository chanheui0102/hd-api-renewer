// src/middlewares/email.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { isEmail } from 'class-validator';

export function emailMiddleware(paramName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const email = req.query[paramName] || req.body[paramName];
        if (!email || !isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        // lowercase
        req.body[paramName] = email.toLowerCase();
        next();
    };
}
