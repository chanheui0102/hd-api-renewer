// src/middlewares/recommend.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../services/redis.service'; // e.g. custom
import { RecommendService } from '../services/recommend.service'; // e.g. custom

const redisService = new RedisService();
const recommendService = new RecommendService();

export async function recommendMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
        const allowed = await recommendService.possibleRecommend(ip);
        if (!allowed) {
            res.status(429).json({ message: 'Too many recommendations' });
            return;
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
        return;
    }
}
