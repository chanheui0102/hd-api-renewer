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
        console.log(`[ViewService.view] Article ID: ${id}, IP: ${ip}`);
        const key = `view-${id}-${ip}`;
        const cached = await this.redisService.get(key);
        if (!cached) {
            const now = moment();
            const articleObjectId = new mongoose.Types.ObjectId(id);
            console.log(
                `[ViewService.view] Attempting to add view - Article ObjectId: ${articleObjectId}, IP: ${ip}`
            );

            // "articles._id": new mongoose.Types.ObjectId(id)
            const updateResult = await WebzineModel.updateOne(
                {
                    'articles._id': articleObjectId,
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

            console.log(
                `[ViewService.view] Update result - matchedCount: ${updateResult.matchedCount}, modifiedCount: ${updateResult.modifiedCount}`
            );

            if (updateResult.modifiedCount) {
                await this.redisService.set(key, now.toString(), 1800); // 30 min TTL
                console.log(
                    `[ViewService.view] View added successfully and cached`
                );
                return true;
            } else {
                console.log(
                    `[ViewService.view] Failed to add view - Article may not exist or already has this view`
                );
                return false;
            }
        } else {
            // already viewed
            console.log(
                `[ViewService.view] View already cached (within 30 min)`
            );
            return false;
        }
    }
}
