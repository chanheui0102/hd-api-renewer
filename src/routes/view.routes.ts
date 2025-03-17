// src/routes/view.routes.ts
import { Router } from 'express';
import { ViewController } from '../controllers/view.controller';

const router = Router();
const ctrl = new ViewController();

// POST /view/:id
router.post('/:id', ctrl.registerView.bind(ctrl));

export default router;
