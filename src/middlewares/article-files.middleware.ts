// src/middlewares/article-files.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function articleFilesMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const files = req.files as { Thumbnail?: Express.Multer.File[] };

    if (!files?.Thumbnail) {
        res.status(400).json({ message: 'Thumbnail files are required' });
        return;
    }

    if (files.Thumbnail.length !== 2) {
        res.status(400).json({ message: 'Two thumbnail files are required' });
        return;
    }

    next();
}
