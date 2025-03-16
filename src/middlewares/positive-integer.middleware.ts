// src/middlewares/positive-integer.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function positiveIntegerMiddleware(paramName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const val = parseInt(req.body[paramName] || req.query[paramName], 10);
        if (Number.isNaN(val) || val < 1) {
            return res
                .status(400)
                .json({ message: `${paramName} must be a positive integer` });
        }
        // replace with numeric
        req.body[paramName] = val;
        next();
    };
}
