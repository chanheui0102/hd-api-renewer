// src/controllers/admin.controller.ts
import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { CommentService } from '../services/comment.service';
import { DeleteUsersDto } from '../dtos/admin/delete-users.dto';
import { GrantPermissionDto } from '../dtos/admin/grant-permission.dto';
import { GrantAdminDto } from '../dtos/admin/grant-admin.dto';

export class AdminController {
    private adminService: AdminService;
    private commentService: CommentService;

    constructor() {
        this.adminService = new AdminService();
        this.commentService = new CommentService();
    }

    // DELETE /admin/users
    public async deleteUsers(req: Request, res: Response) {
        try {
            // NestJS에서 @Body() dto -> Express에서는 req.body
            const dto = req.body as DeleteUsersDto;
            const result = await this.adminService.deleteUsers(dto);
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ message: 'Bad Request', error: err });
        }
    }

    // PATCH /admin/users/status
    public async grantPermission(req: Request, res: Response) {
        try {
            const dto = req.body as GrantPermissionDto;
            const updated = await this.adminService.grantPermission(dto);
            return res.json(updated);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Failed to grant permission', error: err });
        }
    }

    // PATCH /admin/:email (adminKeyMiddleware 보호)
    public async grantAdmin(req: Request, res: Response) {
        try {
            const { email } = req.params;
            const dto = req.body as GrantAdminDto;
            const updated = await this.adminService.grantAdmin(email, dto);
            return res.json(updated);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Failed to grant admin', error: err });
        }
    }

    // DELETE /admin/comment
    // NestJS에서 @Body() dto -> Express에서 req.body
    public async deleteComment(req: Request, res: Response) {
        try {
            // 예: DeleteCommentDto
            const dto = req.body;
            const result = await this.commentService.delete(dto);
            return res.json(result);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Failed to delete comment', error: err });
        }
    }
}
