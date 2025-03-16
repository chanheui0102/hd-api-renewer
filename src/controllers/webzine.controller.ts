// src/controllers/webzine.controller.ts
import { Request, Response } from 'express';
import { WebzineService } from '../services/webzine.service';

export class WebzineController {
    private webzineService: WebzineService;

    constructor() {
        this.webzineService = new WebzineService();
    }

    async upload(req: Request, res: Response) {
        try {
            // dto: CreateWebzineDto
            const { publishedDate } = req.body;

            // files: CreateWebzineFileDto
            const files = req.files as {
                Pdf: Express.Multer.File[];
                Thumbnail: Express.Multer.File[];
            };

            const result = await this.webzineService.create(
                { publishedDate },
                files
            );
            return res.status(201).json(result);
        } catch (err) {
            console.error(err);
            return res
                .status(400)
                .json({ message: 'Upload failed', error: err });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const list = await this.webzineService.findAll();
            return res.json(list);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ message: 'Failed', error: err });
        }
    }

    async findOne(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const item = await this.webzineService.findOne(id);
            return res.json(item);
        } catch (err) {
            console.error(err);
            return res.status(404).json({ message: 'Not Found', error: err });
        }
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const dto = req.body; // UpdateWebzineDto
        try {
            const result = await this.webzineService.update(id, dto);
            return res.json(result);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Update failed', error: err });
        }
    }

    async updateThumbnail(
        req: Request & { file?: Express.Multer.File },
        res: Response
    ) {
        const { id } = req.params;
        const { fileType, languageType } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'File is required' });
        }

        try {
            const result = await this.webzineService.updateThumbnail(
                id,
                { fileType, languageType },
                req.file
            );
            return res.json(result);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Update thumbnail failed', error: err });
        }
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const result = await this.webzineService.delete(id);
            return res.json(result);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Delete failed', error: err });
        }
    }
}
