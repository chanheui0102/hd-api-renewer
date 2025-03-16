// src/routes/users.routes.ts
import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { findUserValidation } from '../middlewares/find-user.middleware';
// import { jwtAuthMiddleware } from '../middlewares/jwtAuth'; // custom or passport

const router = Router();
const usersCtrl = new UsersController();

// GET /users
// - roleCheck('dotyadmin')로 admin 검사
router.get(
    '/',
    // jwtAuthMiddleware, roleCheck('dotyadmin'),
    findUserValidation,
    usersCtrl.findAll.bind(usersCtrl)
);

// GET /users/me
router.get(
    '/me',
    // jwtAuthMiddleware,
    usersCtrl.findMe.bind(usersCtrl)
);

// PATCH /users
router.patch(
    '/',
    // jwtAuthMiddleware,
    usersCtrl.update.bind(usersCtrl)
);

// PATCH /users/password
router.patch(
    '/password',
    // jwtAuthMiddleware,
    usersCtrl.changePassword.bind(usersCtrl)
);

// DELETE /users
router.delete(
    '/',
    // jwtAuthMiddleware,
    usersCtrl.deleteById.bind(usersCtrl)
);

// etc: /users/byadmin, /users/admin/password, /users/password/reset, /users/existence ...
export default router;
