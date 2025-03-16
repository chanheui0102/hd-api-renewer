// src/middlewares/status-check.middleware.ts
import { Request, Response, NextFunction } from 'express';

interface RequestWithUser extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        status: string;
    };
}

export function statusCheckMiddleware(allowedStatuses: string[]) {
    return (req: RequestWithUser, res: Response, next: NextFunction) => {
        const user = req.user;
        if (!user || !allowedStatuses.includes(user.status)) {
            return res
                .status(403)
                .json({ message: 'Forbidden: Insufficient status' });
        }
        next();
    };
}
