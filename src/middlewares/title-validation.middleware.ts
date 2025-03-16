// src/middlewares/title-validation.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function titleValidationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const { title } = req.query;
    if (!title) {
        res.status(400).json({ message: 'Title is required' });
        return;
    }
    if (typeof title === 'string' && title.length > 256) {
        res.status(400).json({
            message: 'title value can not exceed 256 characters',
        });
        return;
    }
    next();
}
