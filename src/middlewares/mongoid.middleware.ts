// src/middlewares/mongoid.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { isMongoId } from 'class-validator';

export function mongoIdMiddleware(paramName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const val =
            req.params[paramName] ||
            req.query[paramName] ||
            req.body[paramName];
        if (!val || !isMongoId(val)) {
            return res.status(400).json({ message: 'Invalid Mongo Id' });
        }
        next();
    };
}
