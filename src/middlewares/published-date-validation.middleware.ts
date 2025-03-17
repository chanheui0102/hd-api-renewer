// src/middlewares/published-date-validation.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function publishedDateValidationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const publishedDate = req.query.publushedDate || req.body.publushedDate;
    if (typeof publishedDate !== 'string') {
        return res
            .status(400)
            .json({ message: 'Published date is required as a string' });
    }
    const reg = /^[A-Za-z]{3}\.\d{4}$/;
    if (!reg.test(publishedDate)) {
        return res
            .status(400)
            .json({
                message: 'Published date must match /^[A-Za-z]{3}\\.d{4}$/',
            });
    }
    next();
}
