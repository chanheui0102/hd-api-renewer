// src/middlewares/article-cache.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function articleCacheMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.method !== 'GET') return next();

    const excludePaths: string[] = []; // 타입 명시
    const url = req.originalUrl;

    if (excludePaths.includes(url)) return next();

    // 예: Redis에 "article-cache-{url}" 키로 조회하는 로직
    // cacheService.get(`article-cache-${url}`, (err, data) => {
    //   if (data) {
    //     return res.send(data);
    //   }
    //   next();
    // });

    // 캐싱이 없다면 그냥 next();
    next();
}
