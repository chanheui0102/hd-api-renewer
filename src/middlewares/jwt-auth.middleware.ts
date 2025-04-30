// src/middlewares/jwt-auth.middleware.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

// 예: publicRoutes 목록
const publicRoutes = ['/auth/login', '/auth/refresh'];

interface RequestWithUser extends Request {
    user?: JwtPayload;
}

interface JwtPayload {
    id: string;
    email: string;
    role: string;
    status: string;
}

export const jwtAuthMiddleware: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log('\n=== JWT Auth Check ===');
    console.log('Path:', req.path);
    console.log('Method:', req.method);

    try {
        const authHeader = req.headers.authorization;
        console.log(
            'Auth Header:',
            authHeader ? 'Bearer ...' + authHeader.slice(-10) : 'none'
        );

        if (!authHeader) {
            console.log('❌ No auth header');
            res.status(401).json({ message: 'No authorization header' });
            return next();
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            ) as JwtPayload;
            console.log('✅ Token verified:', {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
            });
            req.user = decoded;
            return next();
        } catch (verifyError) {
            console.log('❌ Token verification failed:', verifyError.message);
            res.status(401).json({ message: 'Token verification failed' });
            return next();
        }
    } catch (error) {
        console.log('❌ JWT middleware error:', error.message);
        res.status(401).json({ message: error.message });
        return next();
    }
};
