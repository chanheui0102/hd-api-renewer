// src/routes/webzine.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { WebzineController } from '../controllers/webzine.controller';

// 미들웨어(파일검증)
import { webzineFilesMiddleware } from '../middlewares/webzine-files.middleware';
import { webzineFileMiddleware } from '../middlewares/webzine-file.middleware';
import { checkPasswordMiddleware } from '../middlewares/checkPasswordMiddleware';

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
    (req, res, next) => {
        console.log('POST /webzines 요청 데이터:', {
            body: req.body,
            files: req.files,
        });
        next();
    },
    checkPasswordMiddleware,
    webzineFilesMiddleware,
    ctrl.upload.bind(ctrl)
);

// GET /webzines
router.get(
    '/',
    (req, res, next) => {
        console.log('GET /webzines 요청 쿼리:', req.query);
        next();
    },
    ctrl.findAll.bind(ctrl)
);

// GET /webzines/:id
router.get(
    '/:id',
    (req, res, next) => {
        console.log('GET /webzines/:id 요청 파라미터:', req.params);
        next();
    },
    ctrl.findOne.bind(ctrl)
);

// PATCH /webzines/:id
router.patch(
    '/:id',
    (req, res, next) => {
        console.log('PATCH /webzines/:id 요청 데이터:', {
            params: req.params,
            body: req.body,
        });
        next();
    },
    ctrl.update.bind(ctrl)
);

// PATCH /webzines/file/:id - FileInterceptor -> multer.single('file')
router.patch(
    '/file/:id',
    upload.single('file'),
    (req, res, next) => {
        console.log('PATCH /webzines/file/:id 요청 데이터:', {
            params: req.params,
            body: req.body,
            file: req.file,
        });
        next();
    },
    webzineFileMiddleware,
    ctrl.updateThumbnail.bind(ctrl)
);

// DELETE /webzines/:id
router.delete(
    '/:id',
    (req, res, next) => {
        console.log('DELETE /webzines/:id 요청 파라미터:', req.params);
        next();
    },
    ctrl.delete.bind(ctrl)
);

export default router;
