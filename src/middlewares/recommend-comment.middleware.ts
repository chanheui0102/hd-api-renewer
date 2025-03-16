// src/middlewares/recommend-comment.middleware.ts
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

export async function recommendCommentMiddleware(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
): Promise<void> {
    const user = req.user;
    if (!user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { articleId, commentId } = req.body;
    if (!articleId || !commentId) {
        res.status(400).json({ message: 'Missing articleId or commentId' });
        return;
    }
    try {
        const allowed = await recommendService.possibleRecommendComment(
            user.id,
            { articleId, commentId }
        );
        if (!allowed) {
            res.status(403).json({
                message: 'Already recommended this comment',
            });
            return;
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
        return;
    }
}
