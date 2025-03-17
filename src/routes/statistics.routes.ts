// src/routes/statistics.routes.ts
import { Router } from 'express';
import { StatisticsController } from '../controllers/statistics.controller';
// import { roleCheckMiddleware, jwtAuthMiddleware } from ...
// import { publishedDateValidationMiddleware } from ...

const router = Router();
const ctrl = new StatisticsController();

// GET /statistics/users/stack
router.get(
    '/users/stack',
    // jwtAuthMiddleware, roleCheckMiddleware(['admin']),
    ctrl.findUsersStack.bind(ctrl)
);

// etc: /users/count/bymonth, /users/count/byday, etc.
// router.get('/users/count/bymonth', ...)

export default router;
