// src/routes/newsletter.routes.ts
import { Router } from 'express';
import { NewsletterController } from '../controllers/newsletter.controller';
import multer from 'multer';
import { uploadNewsletterImagesMiddleware } from '../middlewares/upload-newsletter-images.middleware';
// import { roleCheckMiddleware } from '../middlewares/role-check.middleware';

const router = Router();
const ctrl = new NewsletterController();
const upload = multer({ limits: { fileSize: 12 * 1024 * 1024 } });

const languageList = [
    'arabic',
    'spanish',
    'thai',
    'vietnamese',
    'indonesian',
    'chinese',
    'czech',
    'german',
    'french',
    'hungarian',
    'english',
];

// Build array for .fields
const fields = languageList.map((lang) => ({ name: lang, maxCount: 1 }));

// POST /newsletter
router.post(
    '/',
    // roleCheckMiddleware(['admin']),
    upload.fields(fields),
    uploadNewsletterImagesMiddleware,
    ctrl.create.bind(ctrl)
);

// POST /newsletter/send
router.post(
    '/send',
    // roleCheckMiddleware(['admin']),
    ctrl.send.bind(ctrl)
);

// PATCH /newsletter
router.patch(
    '/',
    // roleCheckMiddleware(['admin']),
    upload.fields(fields),
    ctrl.update.bind(ctrl)
);

// DELETE /newsletter/:id
router.delete(
    '/:id',
    // roleCheckMiddleware(['admin']),
    ctrl.delete.bind(ctrl)
);

// GET /newsletter
router.get(
    '/',
    // roleCheckMiddleware(['admin']),
    ctrl.findAll.bind(ctrl)
);

// GET /newsletter/:id
router.get(
    '/:id',
    // roleCheckMiddleware(['admin']),
    ctrl.findOne.bind(ctrl)
);

// POST /newsletter/visit
router.post('/visit', ctrl.visitByNewsletter.bind(ctrl));

// GET /newsletter/visit
router.get(
    '/visit',
    /* roleCheckMiddleware(['admin']), */ ctrl.findVisitor.bind(ctrl)
);

export default router;
