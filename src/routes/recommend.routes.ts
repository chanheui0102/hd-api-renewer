// src/routes/recommend.routes.ts
import { Router } from 'express';
import { RecommendController } from '../controllers/recommend.controller';
import { recommendMiddleware } from '../middlewares/recommend.middleware';
import { recommendArticleMiddleware } from '../middlewares/recommend-article.middleware';
import { recommendCommentMiddleware } from '../middlewares/recommend-comment.middleware';

const router = Router();
const ctrl = new RecommendController();

// POST /recommend/article
router.post(
    '/article',
    recommendMiddleware, // limit check
    // maybe user check (JWT?), role check, etc.
    // recommendArticleMiddleware, // possibleRecommendArticle
    ctrl.recommendArticle.bind(ctrl)
);

// POST /recommend/comment
router.post(
    '/comment',
    recommendMiddleware,
    // maybe user check (JWT?), etc.
    // recommendCommentMiddleware,
    ctrl.recommendComment.bind(ctrl)
);

export default router;
