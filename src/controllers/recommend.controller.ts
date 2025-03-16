// src/controllers/recommend.controller.ts
import { Request, Response } from 'express';
import { RecommendService } from '../services/recommend.service';

export class RecommendController {
    private recommendService: RecommendService;

    constructor() {
        this.recommendService = new RecommendService();
    }

    public async recommendArticle(req: Request, res: Response) {
        try {
            const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
            const dto = req.body; // { articleId }
            const result = await this.recommendService.recommendArticle(
                ip,
                dto
            );
            return res.status(201).json(result);
        } catch (err) {
            return res.status(400).json({ message: 'Bad Request', error: err });
        }
    }

    public async recommendComment(req: Request, res: Response) {
        try {
            const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
            const dto = req.body; // { articleId, commentId }
            const result = await this.recommendService.recommendComment(
                ip,
                dto
            );
            return res.status(201).json(result);
        } catch (err) {
            return res.status(400).json({ message: 'Bad Request', error: err });
        }
    }

    // optional: unRecommendArticle, unRecommendComment, etc.
}
