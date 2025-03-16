// src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { localAuthMiddleware } from '../middlewares/local-auth.middleware';

const router = Router();
const ctrl = new AuthController();

// POST /auth/login
router.post('/login', localAuthMiddleware, ctrl.login.bind(ctrl));

// POST /auth/refresh
router.post('/refresh', ctrl.refresh.bind(ctrl));

export default router;
