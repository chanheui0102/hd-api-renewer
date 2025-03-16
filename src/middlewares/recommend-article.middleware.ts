// src/middlewares/recommend-article.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { RecommendService } from '../services/recommend.service';

const recommendService = new RecommendService();

interface RequestWithUser extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        status: string;
    };
}

export async function recommendArticleMiddleware(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
): Promise<void> {
    const user = req.user; // from passport or custom
    if (!user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { articleId } = req.body;
    if (!articleId) {
        res.status(400).json({ message: 'Missing articleId' });
        return;
    }
    try {
        const allowed = await recommendService.possibleRecommendArticle(
            user.id,
            { articleId }
        );
        if (!allowed) {
            res.status(403).json({
                message: 'Already recommended this article',
            });
            return;
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
        return;
    }
}
