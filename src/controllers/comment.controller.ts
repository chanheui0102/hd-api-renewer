// src/controllers/comment.controller.ts
import { Request, Response } from 'express';
import { CommentService } from '../services/comment.service';

export class CommentController {
    private commentService: CommentService;

    constructor() {
        this.commentService = new CommentService();
    }

    public async findByArticle(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const page = parseInt(req.query.page as string, 10) || 1;
            const result = await this.commentService.findByArticle(id, page);
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ error: err });
        }
    }

    public async validatePassword(req: Request, res: Response) {
        try {
            const dto = req.body; // ValidateCommentPasswordDto
            const isValid = await this.commentService.validatePassword(dto);
            return res.json(isValid);
        } catch (err) {
            return res.status(400).json({ error: err });
        }
    }

    public async createNonUsersComment(req: Request, res: Response) {
        try {
            const dto = req.body; // CreateCommentDto
            const newComment = await this.commentService.create(dto);
            return res.status(201).json(newComment);
        } catch (err) {
            return res.status(400).json({ error: err });
        }
    }

    public async updateNonUserComment(req: Request, res: Response) {
        try {
            const dto = req.body; // UpdateCommentDto
            const result = await this.commentService.update(dto);
            return res.json(result);
        } catch (err) {
            return res.status(403).json({ error: err });
        }
    }

    public async deleteNonUserComment(req: Request, res: Response) {
        try {
            const dto = req.body; // DeleteCommentDto
            const result = await this.commentService.delete(dto);
            return res.json(result);
        } catch (err) {
            return res.status(403).json({ error: err });
        }
    }
}
