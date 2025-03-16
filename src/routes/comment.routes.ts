// src/routes/comment.routes.ts
import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { nonUserOwnerMiddleware } from '../middlewares/non-user-owner.middleware';
// import { ownerMiddleware } from '../middlewares/owner.middleware';
const router = Router();
const ctrl = new CommentController();

// GET /comment/article/:id?page=
router.get('/article/:id', ctrl.findByArticle.bind(ctrl));

// POST /comment/password/validation
router.post('/password/validation', ctrl.validatePassword.bind(ctrl));

// POST /comment
router.post('/', ctrl.createNonUsersComment.bind(ctrl));

// PATCH /comment (비회원 수정 시 nonUserOwnerMiddleware 검사)
router.patch('/', nonUserOwnerMiddleware, ctrl.updateNonUserComment.bind(ctrl));

// DELETE /comment (비회원 삭제 시 nonUserOwnerMiddleware)
router.delete(
    '/',
    nonUserOwnerMiddleware,
    ctrl.deleteNonUserComment.bind(ctrl)
);

export default router;
