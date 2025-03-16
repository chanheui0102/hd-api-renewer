// src/middlewares/upload-newsletter-images.middleware.ts
import { Request, Response, NextFunction } from 'express';

// or custom check logic if needed
export function uploadNewsletterImagesMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const files = req.files as { [key: string]: Express.Multer.File[] };

    if (!files || Object.keys(files).length === 0) {
        res.status(400).json({ message: 'No files uploaded' });
        return;
    }

    next();
}
