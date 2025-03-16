// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

interface RequestWithUser extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        status: string;
    };
}

export class AuthController {
    private authService: AuthService;
    constructor() {
        this.authService = new AuthService();
    }

    public async login(req: RequestWithUser, res: Response) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const tokens = await this.authService.login(user);
            return res.json(tokens); // { refreshToken, accessToken, createdAt, userId }
        } catch (err) {
            return res
                .status(500)
                .json({ message: 'Internal server error', error: err });
        }
    }

    public async refresh(req: Request, res: Response) {
        try {
            // dto: { accessToken, refreshToken }
            const { accessToken, refreshToken } = req.body;
            const result = await this.authService.refresh({
                accessToken,
                refreshToken,
            });
            return res.json(result);
        } catch (err) {
            return res.status(403).json({
                message: 'Unauthorized or invalid tokens',
                error: err,
            });
        }
    }
}
