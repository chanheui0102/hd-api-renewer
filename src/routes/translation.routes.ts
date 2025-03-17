// src/routes/translation.routes.ts
import { Router } from 'express';
import { TranslationController } from '../controllers/translation.controller';
// import { jwtAuthMiddleware } from '../middlewares/jwt-auth.middleware'; // if needed

const router = Router();
const ctrl = new TranslationController();

router.post(
    '/vod',
    // jwtAuthMiddleware,
    ctrl.translateVod.bind(ctrl)
);

export default router;
