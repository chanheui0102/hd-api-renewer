// src/middlewares/role-check.middleware.ts
import { Request, Response, NextFunction } from 'express';

interface RequestWithUser extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        status: string;
    };
}

export function roleCheckMiddleware(allowedRoles: string[]) {
    return (req: RequestWithUser, res: Response, next: NextFunction) => {
        const user = req.user; // passport-jwt 등에서 세팅
        if (!user || !allowedRoles.includes(user.role)) {
            return res
                .status(403)
                .json({ message: 'Forbidden: Insufficient role' });
        }
        next();
    };
}
