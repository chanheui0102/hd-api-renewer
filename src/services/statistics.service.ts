// src/services/statistics.service.ts
import mongoose from 'mongoose';
import moment from 'moment';
import { UserModel } from '../models/user.model';
import { SubscriberModel } from '../models/subscriber.model';
import { WebzineModel } from '../models/webzine.model';
import { GaService } from './ga.service'; // or similar
import { CalendarDto } from '../dtos/calendar.dto'; // e.g. { begin: Date, end: Date }

export class StatisticsService {
    private gaService: GaService;

    constructor() {
        this.gaService = new GaService();
        // etc. userModel, subscriberModel, webzineModel can be imported directly
    }

    public async findUsersStack(dto: { begin: Date; end: Date }) {
        const { begin, end } = dto;
        // aggregator on SubscriberModel
        const subscribeUser = await SubscriberModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: begin,
                        $lt: end,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    subscribeUser: '$count',
                },
            },
        ]);
        const visitors = await this.gaService.getVisitors(begin, end); // example

        return {
            subscribeUser:
                subscribeUser.length > 0 ? subscribeUser[0].subscribeUser : 0,
            visitors,
        };
    }

    // e.g. findCountBymonth, findCountByday, findCountByHour, etc.
    public async findCountBymonth(dto: { begin: Date; end: Date }) {
        const { begin, end } = dto;
        // aggregator on subscriber, group by year/month
        // ...
        return { subscribers: [], visitors: [] };
    }

    public async findTop(publishedDate: string) {
        // aggregator on WebzineModel
        const docs = await WebzineModel.aggregate([
            { $match: { publishedDate: publishedDate } },
            {
                $project: {
                    articles: {
                        $map: {
                            input: '$articles',
                            as: 'article',
                            in: {
                                title: '$$article.title',
                                viewCount: { $size: '$$article.views' },
                                recommendCount: {
                                    $size: '$$article.recommends',
                                },
                                commentCount: { $size: '$$article.comments' },
                                category: '$$article.category',
                            },
                        },
                    },
                },
            },
            { $unwind: '$articles' },
            { $replaceRoot: { newRoot: '$articles' } },
        ]);

        if (!docs.length) {
            return {
                totalViewCount: 0,
                totalRecommendCount: 0,
                totalCommentCount: 0,
                viewTop: [],
                recommendTop: [],
                commentTop: [],
            };
        }

        // filter out category: 'Header'
        const filtered = docs.filter((doc: any) => doc.category !== 'Header');
        // sum up
        let totalViewCount = 0;
        let totalRecommendCount = 0;
        let totalCommentCount = 0;
        filtered.forEach((doc: any) => {
            totalViewCount += doc.viewCount;
            totalRecommendCount += doc.recommendCount;
            totalCommentCount += doc.commentCount;
        });
        // sort and clone
        const viewTop = [...filtered].sort((a, b) => b.viewCount - a.viewCount);
        const recommendTop = [...filtered].sort(
            (a, b) => b.recommendCount - a.recommendCount
        );
        const commentTop = [...filtered].sort(
            (a, b) => b.commentCount - a.commentCount
        );

        return {
            totalViewCount,
            totalRecommendCount,
            totalCommentCount,
            viewTop,
            recommendTop,
            commentTop,
        };
    }

    public async findArticleStatistics(dto: {
        begin: Date;
        end: Date;
        publishedDate: string;
    }) {
        // e.g. webzineModel.findOne({ publishedDate: dto.publishedDate })
        const webzine = await WebzineModel.findOne(
            { publishedDate: dto.publishedDate },
            { articles: 1 }
        );
        if (!webzine) {
            return {
                totalViewCount: 0,
                totalRecommendCount: 0,
                totalCommentCount: 0,
                articles: [],
            };
        }
        const { begin, end } = dto;
        let totalViewCount = 0;
        let totalRecommendCount = 0;
        let totalCommentCount = 0;
        const results = webzine.articles.map((article: any) => {
            const viewCount = article.views.filter(
                (v: any) => begin <= v.createdAt && v.createdAt <= end
            ).length;
            const commentCount = article.comments.filter(
                (c: any) => begin <= c.createdAt && c.createdAt <= end
            ).length;
            const recommendCount = article.recommends.filter(
                (r: any) => begin <= r.createdAt && r.createdAt <= end
            ).length;
            totalViewCount += viewCount;
            totalRecommendCount += recommendCount;
            totalCommentCount += commentCount;
            return {
                category: article.category,
                title: article.title,
                viewCount,
                recommendCount,
                commentCount,
            };
        });
        return {
            totalViewCount,
            totalRecommendCount,
            totalCommentCount,
            articles: results,
        };
    }

    // helper methods, e.g. inputBlinkDate, findCountByday, etc.
    // basically the same aggregator logic as NestJS, but no Nest features
}
