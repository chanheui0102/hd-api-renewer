// src/controllers/view.controller.ts
import { Request, Response } from 'express';
import { ViewService } from '../services/view.service';

export class ViewController {
    private viewService: ViewService;

    constructor() {
        this.viewService = new ViewService();
    }

    public async registerView(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
            const result = await this.viewService.view(id, ip);
            return res.json({ success: result });
        } catch (err) {
            return res
                .status(500)
                .json({ message: 'Server error', error: err });
        }
    }
}
