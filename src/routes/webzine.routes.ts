// src/routes/webzine.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { WebzineController } from '../controllers/webzine.controller';

// 미들웨어(파일검증)
import { webzineFilesMiddleware } from '../middlewares/webzine-files.middleware';
import { webzineFileMiddleware } from '../middlewares/webzine-file.middleware';

// multer 설정
const upload = multer(); // in-memory. (실무: multer.diskStorage 등)

const router = Router();
const ctrl = new WebzineController();

// POST /webzines - FileFieldsInterceptor -> multer.fields()
router.post(
    '/',
    upload.fields([
        { name: 'Thumbnail', maxCount: 2 },
        { name: 'Pdf', maxCount: 2 },
    ]),
    webzineFilesMiddleware,
    ctrl.upload.bind(ctrl)
);

// GET /webzines
router.get('/', ctrl.findAll.bind(ctrl));

// GET /webzines/:id
router.get('/:id', ctrl.findOne.bind(ctrl));

// PATCH /webzines/:id
router.patch('/:id', ctrl.update.bind(ctrl));

// PATCH /webzines/file/:id - FileInterceptor -> multer.single('file')
router.patch(
    '/file/:id',
    upload.single('file'),
    webzineFileMiddleware,
    ctrl.updateThumbnail.bind(ctrl)
);

// DELETE /webzines/:id
router.delete('/:id', ctrl.delete.bind(ctrl));

export default router;
