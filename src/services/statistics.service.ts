// // src/services/statistics.service.ts
// import mongoose from 'mongoose';
// import moment from 'moment';
// import { UserModel } from '../models/user.model';
// import { SubscriberModel } from '../models/subscriber.model';
// import { WebzineModel } from '../models/webzine.model';
// import { GaService } from './ga.service'; // or similar
// import { CalendarDto } from '../dtos/calendar.dto'; // e.g. { begin: Date, end: Date }

// export class StatisticsService {
//     private gaService: GaService;

//     constructor() {
//         this.gaService = new GaService();
//         // etc. userModel, subscriberModel, webzineModel can be imported directly
//     }

//     public async findUsersStack(dto: { begin: Date; end: Date }) {
//         const { begin, end } = dto;
//         // aggregator on SubscriberModel
//         const subscribeUser = await SubscriberModel.aggregate([
//             {
//                 $match: {
//                     createdAt: {
//                         $gte: begin,
//                         $lt: end,
//                     },
//                 },
//             },
//             {
//                 $group: {
//                     _id: null,
//                     count: { $sum: 1 },
//                 },
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     subscribeUser: '$count',
//                 },
//             },
//         ]);
//         const visitors = await this.gaService.getVisitors(begin, end); // example

//         return {
//             subscribeUser:
//                 subscribeUser.length > 0 ? subscribeUser[0].subscribeUser : 0,
//             visitors,
//         };
//     }

//     // e.g. findCountBymonth, findCountByday, findCountByHour, etc.
//     public async findCountBymonth(dto: { begin: Date; end: Date }) {
//         const { begin, end } = dto;
//         // aggregator on subscriber, group by year/month
//         // ...
//         return { subscribers: [], visitors: [] };
//     }

//     public async findTop(publishedDate: string) {
//         // aggregator on WebzineModel
//         const docs = await WebzineModel.aggregate([
//             { $match: { publishedDate: publishedDate } },
//             {
//                 $project: {
//                     articles: {
//                         $map: {
//                             input: '$articles',
//                             as: 'article',
//                             in: {
//                                 title: '$$article.title',
//                                 viewCount: { $size: '$$article.views' },
//                                 recommendCount: {
//                                     $size: '$$article.recommends',
//                                 },
//                                 commentCount: { $size: '$$article.comments' },
//                                 category: '$$article.category',
//                             },
//                         },
//                     },
//                 },
//             },
//             { $unwind: '$articles' },
//             { $replaceRoot: { newRoot: '$articles' } },
//         ]);

//         if (!docs.length) {
//             return {
//                 totalViewCount: 0,
//                 totalRecommendCount: 0,
//                 totalCommentCount: 0,
//                 viewTop: [],
//                 recommendTop: [],
//                 commentTop: [],
//             };
//         }

//         // filter out category: 'Header'
//         const filtered = docs.filter((doc: any) => doc.category !== 'Header');
//         // sum up
//         let totalViewCount = 0;
//         let totalRecommendCount = 0;
//         let totalCommentCount = 0;
//         filtered.forEach((doc: any) => {
//             totalViewCount += doc.viewCount;
//             totalRecommendCount += doc.recommendCount;
//             totalCommentCount += doc.commentCount;
//         });
//         // sort and clone
//         const viewTop = [...filtered].sort((a, b) => b.viewCount - a.viewCount);
//         const recommendTop = [...filtered].sort(
//             (a, b) => b.recommendCount - a.recommendCount
//         );
//         const commentTop = [...filtered].sort(
//             (a, b) => b.commentCount - a.commentCount
//         );

//         return {
//             totalViewCount,
//             totalRecommendCount,
//             totalCommentCount,
//             viewTop,
//             recommendTop,
//             commentTop,
//         };
//     }

//     public async findArticleStatistics(dto: {
//         begin: Date;
//         end: Date;
//         publishedDate: string;
//     }) {
//         // e.g. webzineModel.findOne({ publishedDate: dto.publishedDate })
//         const webzine = await WebzineModel.findOne(
//             { publishedDate: dto.publishedDate },
//             { articles: 1 }
//         );
//         if (!webzine) {
//             return {
//                 totalViewCount: 0,
//                 totalRecommendCount: 0,
//                 totalCommentCount: 0,
//                 articles: [],
//             };
//         }
//         const { begin, end } = dto;
//         let totalViewCount = 0;
//         let totalRecommendCount = 0;
//         let totalCommentCount = 0;
//         const results = webzine.articles.map((article: any) => {
//             const viewCount = article.views.filter(
//                 (v: any) => begin <= v.createdAt && v.createdAt <= end
//             ).length;
//             const commentCount = article.comments.filter(
//                 (c: any) => begin <= c.createdAt && c.createdAt <= end
//             ).length;
//             const recommendCount = article.recommends.filter(
//                 (r: any) => begin <= r.createdAt && r.createdAt <= end
//             ).length;
//             totalViewCount += viewCount;
//             totalRecommendCount += recommendCount;
//             totalCommentCount += commentCount;
//             return {
//                 category: article.category,
//                 title: article.title,
//                 viewCount,
//                 recommendCount,
//                 commentCount,
//             };
//         });
//         return {
//             totalViewCount,
//             totalRecommendCount,
//             totalCommentCount,
//             articles: results,
//         };
//     }

//     // helper methods, e.g. inputBlinkDate, findCountByday, etc.
//     // basically the same aggregator logic as NestJS, but no Nest features
// }
// src/services/statistics.service.ts
import moment from 'moment';
import { UserModel } from '../models/user.model';
import { SubscriberModel } from '../models/subscriber.model';
import { WebzineModel } from '../models/webzine.model';
import { GaService } from './ga.service';

// 내부 전용 타입
interface DateWithCount {
    date: string;
    count: number;
}

/**
 * 통계 서비스 (Nest 의존성 제거 버전)
 */
export class StatisticsService {
    private gaService: GaService;

    constructor() {
        this.gaService = new GaService();
    }

    /* ------------------------------------------------------------------ */
    /* 1. USERS – 누적(subscribe, visitor)                                */
    /* ------------------------------------------------------------------ */
    public async findUsersStack(dto: { begin: Date; end: Date }) {
        const { begin, end } = dto;

        const subscribeUser = await SubscriberModel.aggregate([
            { $match: { createdAt: { $gte: begin, $lt: end } } },
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0, subscribeUser: '$count' } },
        ]);

        const visitors = await this.gaService.getVisitors(begin, end);

        return {
            subscribeUser:
                subscribeUser.length > 0 ? subscribeUser[0].subscribeUser : 0,
            visitors,
        };
    }

    /* ------------------------------------------------------------------ */
    /* 2. USERS – 월별(subscribers / visitors)                            */
    /* ------------------------------------------------------------------ */
    public async findCountBymonth(dto: { begin: Date; end: Date }) {
        const { begin, end } = dto;

        const subscribers = await SubscriberModel.aggregate([
            { $match: { createdAt: { $gte: begin, $lte: end } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $concat: [
                            { $toString: '$_id.year' },
                            '-',
                            {
                                $cond: [
                                    { $lt: ['$_id.month', 10] },
                                    {
                                        $concat: [
                                            '0',
                                            { $toString: '$_id.month' },
                                        ],
                                    },
                                    { $toString: '$_id.month' },
                                ],
                            },
                        ],
                    },
                    count: 1,
                },
            },
        ]);

        const visitors = await this.gaService.getMonthVisitors(begin, end);

        return {
            subscribers: this.inputBlinkDate(
                begin,
                end,
                'YYYY-MM',
                'month',
                subscribers
            ),
            visitors: this.inputBlinkDate(
                begin,
                end,
                'YYYY-MM',
                'month',
                visitors
            ),
        };
    }

    /* ------------------------------------------------------------------ */
    /* 3. USERS – 일별(create / subscribe / visitors)                     */
    /* ------------------------------------------------------------------ */
    public async findCountByday(dto: { begin: Date; end: Date }) {
        const { begin, end } = dto;

        // 일 범위 배열 생성
        const datesInRange: string[] = [];
        const currentDate = moment(begin).clone();
        const endDateM = moment(end).clone();
        while (currentDate.isSameOrBefore(endDateM)) {
            datesInRange.push(currentDate.format('YYYY-MM-DD'));
            currentDate.add(1, 'day');
        }
        datesInRange.pop(); // end 당일 제외

        // 초기 맵
        const createMap: Record<string, number> = {};
        const subscribeMap: Record<string, number> = {};
        const visitorMap: Record<string, number> = {};
        datesInRange.forEach((d) => {
            createMap[d] = 0;
            subscribeMap[d] = 0;
            visitorMap[d] = 0;
        });

        // createUsers 집계
        const createUsers = await UserModel.aggregate([
            { $match: { createdAt: { $gte: begin, $lte: end } } },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$createdAt',
                            },
                        },
                    },
                    count: { $sum: 1 },
                },
            },
        ]);
        createUsers.forEach((row) => (createMap[row._id.date] = row.count));

        // subscribeUsers 집계
        const subscribeUsers = await UserModel.aggregate([
            { $match: { subscribedAt: { $gte: begin, $lte: end } } },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$subscribedAt',
                            },
                        },
                    },
                    count: { $sum: 1 },
                },
            },
        ]);
        subscribeUsers.forEach(
            (row) => (subscribeMap[row._id.date] = row.count)
        );

        // visitors (GA)
        const visitors = await this.gaService.getDailyVisitors(begin, end);
        visitors.forEach((v) => (visitorMap[v.date] = v.count));

        return {
            createUsers: Object.entries(createMap).map(([date, count]) => ({
                date,
                count,
            })),
            subscribeUsers: Object.entries(subscribeMap).map(
                ([date, count]) => ({ date, count })
            ),
            visitors: Object.entries(visitorMap).map(([date, count]) => ({
                date,
                count,
            })),
        };
    }

    /* ------------------------------------------------------------------ */
    /* 4. USERS – 시간별(create / subscribe / visitors)                   */
    /* ------------------------------------------------------------------ */
    public async findCountByhour(dto: { begin: Date; end: Date }) {
        const { begin, end } = dto;

        if (moment(end).diff(begin, 'days') > 8)
            throw new Error('Date range must be ≤ 7 days');

        const hoursInRange: string[] = [];
        const cur = moment(begin).clone();
        const endM = moment(end).clone();
        while (cur.isSameOrBefore(endM)) {
            hoursInRange.push(cur.format('YYYY-MM-DD HH:00:00'));
            cur.add(1, 'hour');
        }
        hoursInRange.pop();

        const initMap = () =>
            Object.fromEntries(hoursInRange.map((h) => [h, 0]));
        const createMap = initMap();
        const subscribeMap = initMap();
        const visitorMap = initMap();

        // createUsers
        const createUsers = await UserModel.aggregate([
            { $match: { createdAt: { $gte: begin, $lt: end } } },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%d %H:00:00',
                                date: '$createdAt',
                            },
                        },
                    },
                    count: { $sum: 1 },
                },
            },
        ]);
        createUsers.forEach((r) => (createMap[r._id.date] = r.count));

        // subscribeUsers
        const subscribeUsers = await UserModel.aggregate([
            { $match: { subscribedAt: { $gte: begin, $lt: end } } },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%d %H:00:00',
                                date: '$subscribedAt',
                            },
                        },
                    },
                    count: { $sum: 1 },
                },
            },
        ]);
        subscribeUsers.forEach((r) => (subscribeMap[r._id.date] = r.count));

        // visitors
        const visitors = await this.gaService.getVisitorsPerHour(begin, end);
        visitors.forEach((v) => (visitorMap[v.date] = v.count));

        return {
            createUsers: Object.entries(createMap).map(([date, count]) => ({
                date,
                count,
            })),
            subscribeUsers: Object.entries(subscribeMap).map(
                ([date, count]) => ({ date, count })
            ),
            visitors: Object.entries(visitorMap).map(([date, count]) => ({
                date,
                count,
            })),
        };
    }

    /* ------------------------------------------------------------------ */
    /* 5. WEBZINES – TOP & ARTICLES                                       */
    /* ------------------------------------------------------------------ */
    public async findTop(publishedDate: string) {
        const docs = await WebzineModel.aggregate([
            { $match: { publishedDate } },
            {
                $project: {
                    articles: {
                        $map: {
                            input: '$articles',
                            as: 'a',
                            in: {
                                title: '$$a.title',
                                viewCount: { $size: '$$a.views' },
                                recommendCount: { $size: '$$a.recommends' },
                                commentCount: { $size: '$$a.comments' },
                                category: '$$a.category',
                            },
                        },
                    },
                },
            },
            { $unwind: '$articles' },
            { $replaceRoot: { newRoot: '$articles' } },
        ]);

        if (!docs.length)
            return {
                totalViewCount: 0,
                totalRecommendCount: 0,
                totalCommentCount: 0,
                viewTop: [],
                recommendTop: [],
                commentTop: [],
            };

        const filtered = docs.filter((d: any) => d.category !== 'Header');

        let totalViewCount = 0,
            totalRecommendCount = 0,
            totalCommentCount = 0;
        filtered.forEach((d: any) => {
            totalViewCount += d.viewCount;
            totalRecommendCount += d.recommendCount;
            totalCommentCount += d.commentCount;
        });

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
        const webzine = await WebzineModel.findOne(
            { publishedDate: dto.publishedDate },
            { articles: 1 }
        );
        if (!webzine)
            return {
                totalViewCount: 0,
                totalRecommendCount: 0,
                totalCommentCount: 0,
                articles: [],
            };

        const { begin, end } = dto;
        let totalViewCount = 0,
            totalRecommendCount = 0,
            totalCommentCount = 0;

        const articles = webzine.articles.map((article: any) => {
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
            articles,
        };
    }

    /* ------------------------------------------------------------------ */
    /* 6. 공통 유틸 – 빈 날짜/월 채우기                                   */
    /* ------------------------------------------------------------------ */
    private inputBlinkDate(
        begin: Date,
        end: Date,
        format: string,
        unit: 'month' | 'day',
        features: DateWithCount[]
    ) {
        // 전체 기간의 날짜/월 목록
        const timeline: string[] = [];
        const curr = moment(begin).clone();
        const endM = moment(end).clone();
        while (curr.isSameOrBefore(endM)) {
            timeline.push(curr.format(format));
            curr.add(1, unit);
        }
        timeline.pop();

        // 초기 0 세팅
        const map = new Map<string, DateWithCount>(
            timeline.map((d) => [d, { date: d, count: 0 }])
        );

        // 실제 카운트 덮어쓰기
        features.forEach((f) => map.set(f.date, f));

        return Array.from(map.values());
    }
}
