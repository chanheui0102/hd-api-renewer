// src/services/recommend.service.ts
import mongoose from 'mongoose';
import { WebzineModel } from '../models/webzine.model'; // or wherever webzine is
import { CreateRecommendArticleDto } from '../dtos/recommend/create-recommend-article.dto';
import { CreateRecommendCommentDto } from '../dtos/recommend/create-recommend-comment.dto';
import { RedisService } from './redis.service';

export class RecommendService {
    private redisService: RedisService;

    constructor() {
        this.redisService = new RedisService();
    }

    public async recommendArticle(ip: string, dto: CreateRecommendArticleDto) {
        const { articleId } = dto;
        const now = new Date();

        const doc = await WebzineModel.findOneAndUpdate(
            { 'articles._id': new mongoose.Types.ObjectId(articleId) },
            {
                $addToSet: {
                    'articles.$[elem].recommends': { ip, createdAt: now },
                },
            },
            {
                arrayFilters: [
                    { 'elem._id': new mongoose.Types.ObjectId(articleId) },
                ],
                projection: { articles: 1 },
                new: true,
            }
        );
        if (!doc) throw new Error('Article not found');

        const foundArticle = doc.articles.find(
            (a) => a._id.toString() === articleId
        );
        const recommendCount = foundArticle
            ? foundArticle.recommends.length
            : 0;
        return { _id: articleId, recommendCount };
    }

    public async recommendComment(ip: string, dto: CreateRecommendCommentDto) {
        const { articleId, commentId } = dto;
        const now = new Date();

        const doc = await WebzineModel.findOneAndUpdate(
            { 'articles._id': new mongoose.Types.ObjectId(articleId) },
            {
                $addToSet: {
                    'articles.$[article].comments.$[comment].recommends': {
                        ip,
                        createdAt: now,
                    },
                },
            },
            {
                arrayFilters: [
                    { 'article._id': new mongoose.Types.ObjectId(articleId) },
                    { 'comment._id': new mongoose.Types.ObjectId(commentId) },
                ],
                projection: { articles: 1 },
                new: true,
            }
        );
        if (!doc) throw new Error('Article or comment not found');

        const foundArticle = doc.articles.find(
            (a) => a._id.toString() === articleId
        );
        if (!foundArticle) throw new Error('Article not found');
        const comment = foundArticle.comments.find(
            (c) => c._id.toString() === commentId
        );
        if (!comment) throw new Error('Comment not found');
        const recommendCount = comment.recommends
            ? comment.recommends.length
            : 0;

        return { _id: commentId, recommendCount };
    }

    public async possibleRecommendArticle(
        userId: string,
        dto: CreateRecommendArticleDto
    ) {
        const { articleId } = dto;
        const docs = await WebzineModel.aggregate([
            {
                $match: {
                    'articles._id': new mongoose.Types.ObjectId(articleId),
                },
            },
            {
                $project: {
                    articles: {
                        $filter: {
                            input: '$articles',
                            as: 'sub',
                            cond: {
                                $eq: [
                                    '$$sub._id',
                                    new mongoose.Types.ObjectId(articleId),
                                ],
                            },
                        },
                    },
                },
            },
            { $unwind: '$articles' },
            { $replaceRoot: { newRoot: '$articles' } },
            {
                $project: {
                    _id: 0,
                    recommends: {
                        $filter: {
                            input: '$recommends',
                            as: 'sub',
                            cond: { $eq: ['$$sub.userId', userId] },
                        },
                    },
                },
            },
        ]);
        // if docs[0].recommends.length = 0 => can recommend
        return docs.length && docs[0].recommends.length === 0;
    }

    public async possibleRecommendComment(
        userId: string,
        dto: CreateRecommendCommentDto
    ) {
        const { articleId, commentId } = dto;
        const docs = await WebzineModel.aggregate([
            {
                $match: {
                    'articles._id': new mongoose.Types.ObjectId(articleId),
                },
            },
            {
                $project: {
                    articles: {
                        $filter: {
                            input: '$articles',
                            as: 'sub',
                            cond: {
                                $eq: [
                                    '$$sub._id',
                                    new mongoose.Types.ObjectId(articleId),
                                ],
                            },
                        },
                    },
                },
            },
            { $unwind: '$articles' },
            { $replaceRoot: { newRoot: '$articles' } },
            {
                $project: {
                    comments: {
                        $filter: {
                            input: '$comments',
                            as: 'sub',
                            cond: {
                                $eq: [
                                    '$$sub._id',
                                    new mongoose.Types.ObjectId(commentId),
                                ],
                            },
                        },
                    },
                },
            },
            { $unwind: '$comments' },
            { $replaceRoot: { newRoot: '$comments' } },
            {
                $project: {
                    recommends: {
                        $filter: {
                            input: '$recommends',
                            as: 'sub',
                            cond: { $eq: ['$$sub.userId', userId] },
                        },
                    },
                },
            },
        ]);
        // if docs.length && docs[0].recommends.length === 0 => can recommend
        if (!docs.length) return true;
        return docs[0].recommends.length === 0;
    }

    public async possibleRecommend(ip: string): Promise<boolean> {
        const key = `recommend-${ip}`;
        const value = await this.redisService.get(key);
        const count = parseInt(value || '0', 10);

        if (Number.isNaN(count)) {
            await this.redisService.set(key, '1', 60);
            return true;
        }

        if (count < 20) {
            await this.redisService.incr(key);
            return true;
        }

        return false;
    }

    // optional: unRecommendArticle, unRecommendComment...
}
