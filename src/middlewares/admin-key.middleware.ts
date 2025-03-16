// src/middlewares/admin-key.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';

const adminService = new AdminService(); // 혹은 DI/싱글턴 방식

export async function adminKeyMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        // unencrypted 헤더 추출
        const unencrypted = req.headers['unencrypted'];
        if (!unencrypted || typeof unencrypted !== 'string') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const isUnlocked = await adminService.unLock(unencrypted.trim());
        if (!isUnlocked) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    } catch (err) {
        console.error(err);
        return res.status(403).json({ message: 'Forbidden' });
    }
}
