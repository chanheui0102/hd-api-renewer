// src/middlewares/webzine-files.middleware.ts
import { Request, Response, NextFunction } from 'express';

// CreateWebzineFileDto 구조를 빌려서 검사
export function webzineFilesMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const files = req.files as {
        Thumbnail?: Express.Multer.File[];
        Pdf?: Express.Multer.File[];
    };

    if (!files?.Pdf || !files?.Thumbnail) {
        res.status(400).json({ message: 'There is no files' });
        return;
    }

    if (files.Pdf.length !== 2) {
        res.status(400).json({
            message:
                'Pdf should have english and español version as array type',
        });
        return;
    }

    if (files.Thumbnail.length !== 2) {
        res.status(400).json({
            message:
                'Thumbnail should have normal and wide version as array type',
        });
        return;
    }

    next();
}
