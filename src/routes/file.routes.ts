// src/routes/file.routes.ts
import { Router } from 'express';
import { FileController } from '../controllers/file.controller';

// (선택) import { checkJwt } from '../middlewares/auth'; // 예시
// (선택) import { checkRole } from '../middlewares/role'; // 예시

const router = Router();
const fileCtrl = new FileController();

// GET /file/users
router.get(
    '/users',
    // checkJwt,   // JWT 인증 미들웨어(대체 @UseGuards(JwtAuthGuard))
    // checkRole(['admin', 'user']), // Role 체크(대체 @Roles())
    fileCtrl.downloadUsers.bind(fileCtrl)
);

// GET /file/subscribers
router.get(
    '/subscribers',
    // checkJwt,
    // checkRole(['admin']), // 예: 관리자만
    fileCtrl.downloadSubscribers.bind(fileCtrl)
);

export default router;
