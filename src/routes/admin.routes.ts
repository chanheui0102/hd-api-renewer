// src/routes/admin.routes.ts
import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { adminKeyMiddleware } from '../middlewares/admin-key.middleware';
// import { jwtAuthMiddleware } from '../middlewares/jwtAuth';
// import { roleCheckMiddleware } from '../middlewares/role.middleware';

const router = Router();
const ctrl = new AdminController();

// DELETE /admin/users
router.delete(
    '/users',
    // jwtAuthMiddleware,
    // roleCheckMiddleware(['dotyadmin']),
    ctrl.deleteUsers.bind(ctrl)
);

// PATCH /admin/users/status
router.patch(
    '/users/status',
    // jwtAuthMiddleware,
    // roleCheckMiddleware(['admin','dotyadmin']),
    ctrl.grantPermission.bind(ctrl)
);

// PATCH /admin/:email
router.patch(
    '/:email',
    // adminKeyMiddleware,
    ctrl.grantAdmin.bind(ctrl)
);

// DELETE /admin/comment
router.delete(
    '/comment',
    // jwtAuthMiddleware,
    // roleCheckMiddleware(['admin']),
    ctrl.deleteComment.bind(ctrl)
);

export default router;
