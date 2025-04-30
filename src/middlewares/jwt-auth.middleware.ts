// src/middlewares/jwt-auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

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

export const jwtAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Authorization 헤더에서 토큰 추출 방식 개선
        const authHeader = req.headers.authorization;
        console.log('Auth Header:', authHeader); // 디버깅용

        if (!authHeader) {
            throw new Error('No authorization header');
        }

        // Bearer 토큰 형식 처리
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;

        if (!token) {
            throw new Error('No token provided');
        }

        // 토큰 검증
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'secretKey'
        );
        req.user = decoded;

        next();
    } catch (error) {
        console.error('JWT Auth Error:', error);
        res.status(401).json({
            message: 'Unauthorized',
            error: error.message,
        });
    }
};
