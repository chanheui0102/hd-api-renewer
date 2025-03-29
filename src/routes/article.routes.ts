// src/routes/article.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { ArticleController } from '../controllers/article.controller';
import { articleFilesMiddleware } from '../middlewares/article-files.middleware';
import { titleValidationMiddleware } from '../middlewares/title-validation.middleware';
import { categoryValidationMiddleware } from '../middlewares/category.middleware';
import { checkPasswordMiddleware } from '../middlewares/checkPasswordMiddleware';

const router = Router();
const ctrl = new ArticleController();

const upload = multer(); // in-memory (필요하다면 diskStorage)

// POST /articles/header/:webzineId
router.post(
    '/header/:webzineId',
    // jwtAuthMiddleware, roleCheckMiddleware(['admin']),
    upload.fields([{ name: 'Thumbnail', maxCount: 2 }]),
    articleFilesMiddleware,
    ctrl.uploadHeader.bind(ctrl)
);

// POST /articles/:webzineId
router.post(
    '/:webzineId',
    // jwtAuthMiddleware, roleCheckMiddleware(['admin']),
    upload.fields([{ name: 'Thumbnail', maxCount: 2 }]),
    checkPasswordMiddleware,
    articleFilesMiddleware,
    ctrl.upload.bind(ctrl)
);

// GET /articles/search?title=...
router.get('/search', titleValidationMiddleware, ctrl.findByTitle.bind(ctrl));

// GET /articles/webzine/:webzineId
router.get('/webzine/:webzineId', ctrl.findByWebzine.bind(ctrl));

// GET /articles/category/:category
router.get(
    '/category/:category',
    categoryValidationMiddleware,
    ctrl.findByCategory.bind(ctrl)
);

// GET /articles/:id
router.get('/:id', ctrl.findById.bind(ctrl));

// DELETE /articles/:id
router.delete(
    '/:id',
    // jwtAuthMiddleware, roleCheckMiddleware(['admin']),
    ctrl.deleteById.bind(ctrl)
);

// PATCH /articles/:id (with optional form-data)
router.patch(
    '/:id',
    // jwtAuthMiddleware, roleCheckMiddleware(['admin']),
    upload.fields([{ name: 'Thumbnail', maxCount: 2 }]),
    // articleFilesMiddleware (필요시)
    ctrl.updateById.bind(ctrl)
);

// PATCH /articles/thumbnail/:id (single file)
router.patch(
    '/thumbnail/:id',
    // jwtAuthMiddleware, roleCheckMiddleware(['admin']),
    upload.single('thumbnail'),
    ctrl.updateThumbnail.bind(ctrl)
);

export default router;
