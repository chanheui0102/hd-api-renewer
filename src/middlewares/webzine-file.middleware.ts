// src/middlewares/webzine-file.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Request as MulterRequest } from 'express-serve-static-core';

interface RequestWithFile extends Request {
    file?: Express.Multer.File;
}

export function webzineFileMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (!req.file) {
        res.status(400).json({ message: "The file doesn't exist." });
        return;
    }
    next();
}
