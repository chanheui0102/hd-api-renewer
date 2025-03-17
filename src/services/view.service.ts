// src/services/view.service.ts
import mongoose from 'mongoose';
import moment from 'moment';
import { WebzineModel } from '../models/webzine.model'; // e.g. define in webzine.model.ts
import { RedisService } from './redis.service'; // your custom redis service

export class ViewService {
    private redisService: RedisService;

    constructor() {
        this.redisService = new RedisService();
    }

    public async view(id: string, ip: string): Promise<boolean> {
        // "id" is presumably "articleId"
        const key = `view-${id}-${ip}`;
        const cached = await this.redisService.get(key);
        if (!cached) {
            const now = moment();
            // "articles._id": new mongoose.Types.ObjectId(id)
            const updateResult = await WebzineModel.updateOne(
                {
                    'articles._id': new mongoose.Types.ObjectId(id),
                },
                {
                    $push: {
                        'articles.$.views': {
                            ip,
                            createdAt: now.toDate(),
                        },
                    },
                }
            );
            if (updateResult.modifiedCount) {
                await this.redisService.set(key, now.toString(), 1800); // 30 min TTL
                return true;
            } else {
                return false;
            }
        } else {
            // already viewed
            return false;
        }
    }
}
