// src/middlewares/attachment-validation.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function attachmentValidationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // e.g. req.files['attachments']
    let totalSize = 0;
    const files = (req.files as Record<string, Express.Multer.File[]>)
        ?.attachments;
    if (!files) return next();

    for (const file of files) {
        totalSize += file.size;
        if (totalSize > 30 * 1024 * 1024) {
            return res
                .status(400)
                .json({
                    message: 'Total size of attachments should be < 30mb',
                });
        }
    }
    next();
}
