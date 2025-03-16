// src/services/auth.service.ts
import { UserModel } from '../models/user.model';
import { RefreshModel } from '../models/refresh.model';
import { CreateRefreshDto } from '../dtos/auth/create-refresh.dto';
import jwt from 'jsonwebtoken';
import moment from 'moment';

const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';

export class AuthService {
    // constructor() { ... }
    // userService, etc.

    public async validateUser(email: string, password: string) {
        // 예: userService.validate(email, password)
        // or userModel.findOne -> bcrypt.compare
        const user = await UserModel.findOne({ email });
        if (!user) return null;
        // bcrypt.compare(password, user.password) → if mismatch return null
        return user; // if match
    }

    public async login(user: {
        id: string; // user._id.toString()
        email: string;
        role: string;
        status: string;
    }) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
        };
        // Access token
        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
        // Refresh token
        const refreshToken = jwt.sign({ accessToken }, JWT_SECRET, {
            expiresIn: '14d',
        });

        // DB에 기존 refresh 삭제 후 새로 저장
        await RefreshModel.deleteMany({ userId: user.id });
        const doc = await RefreshModel.create({
            accessToken,
            refreshToken,
            createdAt: Date.now(),
            userId: user.id,
        });

        // user lastLoginDate, active update
        await UserModel.updateOne(
            { _id: user.id },
            { lastLoginDate: new Date(), active: true }
        );

        return {
            refreshToken: doc.refreshToken,
            accessToken: doc.accessToken,
            createdAt: doc.createdAt,
            userId: doc.userId,
        };
    }

    public async refresh(dto: CreateRefreshDto) {
        // dto: { accessToken, refreshToken }
        // verify tokens, findOneAndDelete
        const { accessToken, refreshToken } = dto;
        try {
            const verifyResult = jwt.verify(refreshToken, JWT_SECRET) as any;
            // verifyResult.accessToken should match dto.accessToken
            const doc = await RefreshModel.findOneAndDelete({
                accessToken,
                refreshToken,
            });
            if (!doc) {
                throw new Error('No tokens');
            }
            // parse original payload
            const oldPayload = jwt.decode(accessToken) as any; // { id, email, role, status, etc. }
            // re-login
            return this.login({
                id: oldPayload.id,
                email: oldPayload.email,
                role: oldPayload.role,
                status: oldPayload.status,
            });
        } catch (err) {
            throw new Error('Invalid refresh token');
        }
    }

    public async deleteRefreshTokens(userIds: string[]) {
        return RefreshModel.deleteMany({
            userId: { $in: userIds },
        });
    }
}
