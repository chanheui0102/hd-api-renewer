// src/routes/subscriber.routes.ts
import { Router } from 'express';
import { SubscriberController } from '../controllers/subscriber.controller';

// JWT/Role 미들웨어, 파이프(Validation) 등 필요시 import
// import { jwtAuthMiddleware } from '../middlewares/jwtAuth';

const router = Router();
const ctrl = new SubscriberController();

// GET /subscriber
router.get('/', ctrl.findAll.bind(ctrl));

// POST /subscriber
router.post('/', ctrl.subscribe.bind(ctrl));

// DELETE /subscriber/:email
router.delete('/:email', ctrl.unSubscribe.bind(ctrl));

// GET /subscriber/code?email=&type=subscribe
router.get('/code', ctrl.requestCode.bind(ctrl));

// GET /subscriber/code/verification?email=&type=&code=
router.get('/code/verification', ctrl.validateCode.bind(ctrl));

export default router;
