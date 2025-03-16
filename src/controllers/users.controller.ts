// src/controllers/users.controller.ts
import { Request, Response } from 'express';
import { UsersService } from '../services/user.service';

interface RequestWithUser extends Request {
    user?: { id: string };
}

export class UsersController {
    private usersService: UsersService;

    constructor() {
        this.usersService = new UsersService();
    }

    public async findAll(req: Request, res: Response) {
        try {
            // query 파싱
            const {
                begin,
                end,
                limit,
                page,
                iso2,
                region,
                status,
                orderBy,
                name,
                nickname,
            } = req.query as Record<string, any>;

            const dto = {
                begin,
                end,
                limit: +limit,
                page: +page,
                iso2,
                region,
                status,
                orderBy,
                name,
                nickname,
            };
            const result = await this.usersService.findAll(dto);
            return res.json(result);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ message: 'Bad Request', error: err });
        }
    }

    public async findMe(req: RequestWithUser, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const user = await this.usersService.findById(userId);
            return res.json(user);
        } catch (err) {
            return res
                .status(404)
                .json({ message: 'User not found', error: err });
        }
    }

    public async update(req: RequestWithUser, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const dto = req.body;
            const updated = await this.usersService.update(userId, dto);
            return res.json(updated);
        } catch (err) {
            return res
                .status(400)
                .json({ message: 'Update failed', error: err });
        }
    }

    public async changePassword(req: RequestWithUser, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const { password, newPassword } = req.body;
            const result = await this.usersService.changePassword(userId, {
                password,
                newPassword,
            });
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ message: 'Failed', error: err });
        }
    }

    public async deleteById(req: RequestWithUser, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const result = await this.usersService.deleteUser(userId);
            return res.json({ success: result });
        } catch (err) {
            return res.status(400).json({ message: 'Failed', error: err });
        }
    }

    // etc... (updateByAdmin, changeAdminPassword, resetPassword, isExist ...)
}
