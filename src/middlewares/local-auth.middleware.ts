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
): void {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (!user) {
            return res
                .status(401)
                .json({ message: info?.message || 'Unauthorized' });
        }
        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            status: user.status,
        };
        next();
    })(req, res, next);
}
