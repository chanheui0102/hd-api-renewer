// src/middlewares/jwt-auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

// 예: publicRoutes 목록
const publicRoutes = ['/auth/login', '/auth/refresh'];

interface RequestWithUser extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        status: string;
        iat?: number;
        exp?: number;
    };
}

export function jwtAuthMiddleware(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) {
    // if request path is in publicRoutes, skip
    if (publicRoutes.includes(req.path)) {
        return next();
    }
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user; // { id, email, role, status, iat, exp }
        next();
    })(req, res, next);
}
