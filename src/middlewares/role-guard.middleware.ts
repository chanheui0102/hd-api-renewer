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
        // user 정보: passport-jwt 또는 다른 인증 미들웨어에서 세팅
        const user = req.user;
        if (!user) {
            return res
                .status(401)
                .json({ message: 'Unauthorized Role Permission' });
        }
        if (!allowedRoles.includes(user.role)) {
            return res
                .status(403)
                .json({ message: 'Forbidden (role mismatch)' });
        }
        next();
    };
}
