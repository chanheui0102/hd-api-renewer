// src/controllers/article.controller.ts
import { Request, Response } from 'express';
import { ArticleService } from '../services/article.service';

export class ArticleController {
    private articleService: ArticleService;

    constructor() {
        this.articleService = new ArticleService();
    }

    public async uploadHeader(req: Request, res: Response) {
        try {
            // webzineId: req.params.webzineId
            const { webzineId } = req.params;
            const { beginPage, endPage } = req.body; // form-data fields
            // files: req.files["Thumbnail"] (2개)
            const files = (req.files as Record<string, Express.Multer.File[]>)
                ?.Thumbnail;

            // dto
            const dto = {
                beginPage: +beginPage,
                endPage: +endPage,
                category: 'Header',
                content: { en: '', es: '' },
                title: { en: '', es: '' },
            };

            const result = await this.articleService.upload(webzineId, dto, {
                Thumbnail: files,
            });
            return res.status(201).json(result);
        } catch (err) {
            return res.status(400).json({ message: 'Bad Request', error: err });
        }
    }

    public async upload(req: Request, res: Response) {
        try {
            const { webzineId } = req.params;
            // createArticleDto
            const dto = req.body;
            const files = (req.files as Record<string, Express.Multer.File[]>)
                ?.Thumbnail;

            const result = await this.articleService.upload(webzineId, dto, {
                Thumbnail: files,
            });
            return res.status(201).json(result);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Upload failed', error: err });
        }
    }

    public async findByTitle(req: Request, res: Response) {
        try {
            // titleValidationMiddleware에서 이미 체크한 후, 여기선 req.query.title 읽기
            const title = req.query.title as string;
            const result = await this.articleService.findByTitle(title);
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ message: 'Bad Request', error: err });
        }
    }

    public async findByWebzine(req: Request, res: Response) {
        try {
            const { webzineId } = req.params;
            const result = await this.articleService.findByWebzine(webzineId);
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ error: err });
        }
    }

    public async findByCategory(req: Request, res: Response) {
        console.log('findByCategory');
        try {
            const { category } = req.params;
            const result = await this.articleService.findByCategory(category);
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ error: err });
        }
    }

    public async findById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
            console.log(
                `[ArticleController.findById] Request IP: ${ip}, Article ID: ${id}, X-Forwarded-For: ${req.headers['x-forwarded-for']}, Remote Address: ${req.socket.remoteAddress}`
            );
            const doc = await this.articleService.findById(ip, id);
            return res.json(doc);
        } catch (err) {
            return res.status(400).json({ error: err });
        }
    }

    public async deleteById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.articleService.deleteById(id);
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ error: err });
        }
    }

    public async updateById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const dto = req.body; // UpdateArticleDto
            const result = await this.articleService.updateById(id, dto);
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ error: err });
        }
    }

    public async updateThumbnail(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { type } = req.body;
            const thumbnail = req.file;

            if (!thumbnail) {
                return res.status(400).json({ message: 'File is required' });
            }

            const result = await this.articleService.updateThumbnail(
                id,
                { type },
                thumbnail
            );
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ error: err });
        }
    }
}
