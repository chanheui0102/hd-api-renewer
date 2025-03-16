// src/controllers/newsletter.controller.ts
import { Request, Response } from 'express';
import { NewsletterService } from '../services/newsletter.service';

export class NewsletterController {
    private newsletterService: NewsletterService;

    constructor() {
        this.newsletterService = new NewsletterService();
    }

    public async create(req: Request, res: Response) {
        try {
            // req.body => CreateNewsletterDto
            // req.files => CreateNewsletterFileDto
            const dto = req.body;
            const fileDto = req.files;
            const newsletter = await this.newsletterService.create(
                dto,
                fileDto
            );
            return res.status(201).json(newsletter);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Could not create newsletter', error: err });
        }
    }

    public async send(req: Request, res: Response) {
        try {
            const newsletter = await this.newsletterService.send(req.body);
            return res.status(201).json(newsletter);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Sending newsletter failed', error: err });
        }
    }

    public async findAll(req: Request, res: Response) {
        try {
            // parse query
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            const orderBy =
                (req.query.orderBy as string) === 'asc' ? 'asc' : 'desc';
            const data = await this.newsletterService.findAll({
                page,
                limit,
                orderBy,
            });
            return res.json(data);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Failed to fetch newsletters', error: err });
        }
    }

    public async findOne(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const newsletter = await this.newsletterService.findById(id);
            return res.json(newsletter);
        } catch (err) {
            return res
                .status(404)
                .json({ message: 'Newsletter not found', error: err });
        }
    }

    public async update(req: Request, res: Response) {
        try {
            const dto = req.body;
            const fileDto = req.files;
            const updated = await this.newsletterService.update(dto, fileDto);
            return res.status(201).json(updated);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Failed to update newsletter', error: err });
        }
    }

    public async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.newsletterService.delete(id);
            return res.json(result);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Failed to delete newsletter', error: err });
        }
    }

    public async visitByNewsletter(req: Request, res: Response) {
        try {
            const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
            const result = await this.newsletterService.visit(ip, req.body);
            return res.json(result);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Failed to record visit', error: err });
        }
    }

    public async findVisitor(req: Request, res: Response) {
        try {
            const visitors = await this.newsletterService.findVisitor();
            return res.json(visitors);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Failed to fetch visitors', error: err });
        }
    }
}
