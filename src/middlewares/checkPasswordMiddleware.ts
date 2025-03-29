// src/middlewares/checkPassword.middleware.ts
import { Request, Response, NextFunction } from 'express';

// 예: 혹은 process.env.WEBZINE_SECRET 등으로 암호값을 분리할 수 있음
const VALID_PASSWORD = 'myHardcodedPassword';

export function checkPasswordMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // body로부터 password를 받는다
    console.log('checkPasswordMiddleware', req.body);
    const { password } = req.body;

    // 비번이 없거나 틀리면 401
    if (!password || password !== VALID_PASSWORD) {
        res.status(401).json({ message: 'Unauthorized: Wrong password' });
        return;
    }

    // password가 맞으면 다음 미들웨어 진행
    next();
}
