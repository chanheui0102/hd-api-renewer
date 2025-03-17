// src/controllers/vod.controller.ts
import { Request, Response } from 'express';
import { VodService } from '../services/vod.service';

interface RequestWithUser extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        status: string;
    };
}

export class VodController {
    private vodService: VodService;

    constructor() {
        this.vodService = new VodService();
    }

    public async create(req: RequestWithUser, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const userId = req.user.id;
            const dto = req.body; // { title, content, category, rawContent }
            const files =
                (req.files as Record<string, Express.Multer.File[]>)
                    ?.attachments || [];

            const result = await this.vodService.create(userId, {
                ...dto,
                attachments: files,
            });
            return res.status(201).json(result);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Create VOD failed', error: err });
        }
    }

    public async find(req: Request, res: Response) {
        // parse query
        // call service.find()
    }

    public async findById(req: Request, res: Response) {
        // parse param id
        // call service.findById(...)
    }

    // etc. pass, hide, answer, modifyAnswer, etc.
}
