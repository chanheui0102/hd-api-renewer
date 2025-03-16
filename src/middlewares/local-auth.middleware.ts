// src/middlewares/local-auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

interface RequestWithUser extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        status: string;
    };
}

export function localAuthMiddleware(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res
                .status(401)
                .json({ message: info?.message || 'Unauthorized' });
        }
        req.user = user;
        next();
    })(req, res, next);
}
