// src/controllers/translation.controller.ts
import { Request, Response } from 'express';
import { TranslationService } from '../services/translation.service';

export class TranslationController {
    private translationService: TranslationService;

    constructor() {
        this.translationService = new TranslationService();
    }

    public async translateVod(req: Request, res: Response) {
        try {
            // parse body
            const dto = req.body; // e.g. { language, contents }
            const result = await this.translationService.translateVod(dto);
            return res.status(200).json(result);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Translate VOD error', error: err });
        }
    }
}
