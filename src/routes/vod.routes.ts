// src/routes/vod.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { VodController } from '../controllers/vod.controller';
// import { attachmentValidationMiddleware } from '../middlewares/attachment-validation.middleware';
// import { answerVodMiddleware } from '../middlewares/answer-vod.middleware';
// import { hideVodMiddleware } from '../middlewares/hide-vod.middleware';
// etc.

const router = Router();
const ctrl = new VodController();
const upload = multer(); // memory storage

// POST /vod
router.post(
    '/',
    // jwtAuthMiddleware,
    // statusCheckMiddleware(['Doty Owner']),
    upload.fields([{ name: 'attachments', maxCount: 50 }]),
    // attachmentValidationMiddleware,
    ctrl.create.bind(ctrl)
);

// GET /vod/:id
router.get('/:id', ctrl.findById.bind(ctrl));

// etc.
export default router;
