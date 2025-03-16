// src/controllers/subscriber.controller.ts
import { Request, Response } from 'express';
import { SubscriberService } from '../services/subscriber.service';

export class SubscriberController {
    private subscriberService: SubscriberService;

    constructor() {
        this.subscriberService = new SubscriberService();
    }

    // GET /subscriber
    public async findAll(req: Request, res: Response) {
        try {
            const { begin, end, page, limit, search } = req.query as Record<
                string,
                any
            >;
            const dto = {
                begin,
                end,
                page: +page,
                limit: +limit,
                search,
            };
            const result = await this.subscriberService.findAll(dto);
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ message: 'Bad Request', error: err });
        }
    }

    // POST /subscriber
    public async subscribe(req: Request, res: Response) {
        try {
            const dto = req.body; // CreateSubscriberDto
            const result = await this.subscriberService.subscribe(dto);
            return res.status(201).json(result);
        } catch (err) {
            return res.status(409).json({ message: 'Conflict', error: err });
        }
    }

    // DELETE /subscriber/:email
    public async unSubscribe(req: Request, res: Response) {
        try {
            const { email } = req.params;
            const result = await this.subscriberService.unSubscribe(email);
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ message: 'Bad Request', error: err });
        }
    }

    // GET /subscriber/code
    public async requestCode(req: Request, res: Response) {
        try {
            const { email, type } = req.query as Record<string, any>;
            const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
            const result = await this.subscriberService.requestCode(ip, {
                email,
                type,
            });
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ message: 'Bad Request', error: err });
        }
    }

    // GET /subscriber/code/verification
    public async validateCode(req: Request, res: Response) {
        try {
            const { email, type, code } = req.query as Record<string, any>;
            const result = await this.subscriberService.validateCode({
                email,
                type,
                code,
            });
            return res.json({ valid: result });
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Validation failed', error: err });
        }
    }
}
