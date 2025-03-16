// src/services/mongodb-pipeline.service.ts
import dotenv from 'dotenv';

dotenv.config();

export class MongodbPipelineService {
    private cdnBase: string;

    constructor() {
        // NestJS의 this.configService.get('AWS_S3_CDN') 대신, .env에서 직접 로드
        this.cdnBase = process.env.AWS_S3_CDN || '';
    }

    // 이전 webzine() 메서드
    public webzine() {
        return {
            $addFields: {
                thumbnail: {
                    en: {
                        $concat: [
                            this.cdnBase,
                            '/',
                            '$publishedDate',
                            '/thumbnail/main/',
                            '$thumbnail.en',
                        ],
                    },
                    es: {
                        $concat: [
                            this.cdnBase,
                            '/',
                            '$publishedDate',
                            '/thumbnail/main/',
                            '$thumbnail.es',
                        ],
                    },
                },
                pdf: {
                    en: {
                        $concat: [
                            this.cdnBase,
                            '/',
                            '$publishedDate',
                            '/pdf/main/',
                            '$pdf.en',
                        ],
                    },
                    es: {
                        $concat: [
                            this.cdnBase,
                            '/',
                            '$publishedDate',
                            '/pdf/main/',
                            '$pdf.es',
                        ],
                    },
                },
                articles: this.articles(false, false, false),
            },
        };
    }

    // articles() 메서드
    public articles(
        includeViews = false,
        includeRecommends = false,
        includeComments = false
    ) {
        let query: any = {};
        if (includeViews) {
            query.views = '$$articles.views';
        }
        if (includeRecommends) {
            query.recommends = '$$articles.recommends';
        }
        if (includeComments) {
            query.comments = '$$articles.comments';
        }
        return {
            $map: {
                input: '$articles',
                as: 'articles',
                in: {
                    _id: '$$articles._id',
                    webzineId: '$$articles.webzineId',
                    category: '$$articles.category',
                    title: '$$articles.title',
                    content: '$$articles.content',
                    createdAt: '$$articles.createdAt',
                    updatedAt: '$$articles.updatedAt',
                    beginPage: '$$articles.beginPage',
                    endPage: '$$articles.endPage',
                    thumbnail: {
                        normal: {
                            $concat: [
                                this.cdnBase,
                                '/',
                                '$publishedDate',
                                '/thumbnail/',
                                '$$articles.category',
                                '/',
                                '$$articles.thumbnail.normal',
                            ],
                        },
                        wide: {
                            $concat: [
                                this.cdnBase,
                                '/',
                                '$publishedDate',
                                '/thumbnail/',
                                '$$articles.category',
                                '/',
                                '$$articles.thumbnail.wide',
                            ],
                        },
                    },
                    viewCount: { $size: '$$articles.views' },
                    recommendCount: { $size: '$$articles.recommends' },
                    commentCount: { $size: '$$articles.comments' },
                    recommended: false,
                    ...query,
                },
            },
        };
    }

    // pagination() 메서드
    public pagination(param: { limit: number; page: number }) {
        const { limit, page } = param;
        return [
            {
                $group: {
                    _id: null,
                    docs: { $push: '$$ROOT' },
                },
            },
            {
                $project: {
                    _id: 0,
                    docs: { $slice: ['$docs', (page - 1) * limit, limit] },
                    totalDocs: { $size: '$docs' },
                    totalPages: {
                        $sum: [
                            {
                                $toInt: {
                                    $floor: {
                                        $divide: [
                                            {
                                                $subtract: [
                                                    { $size: '$docs' },
                                                    1,
                                                ],
                                            },
                                            limit,
                                        ],
                                    },
                                },
                            },
                            1,
                        ],
                    },
                    page: { $toInt: page },
                    limit: { $toInt: limit },
                    pagingCounter: { $toInt: (page - 1) * limit + 1 },
                },
            },
            {
                $addFields: {
                    prevPage: {
                        $cond: {
                            if: { $gt: ['$page', 1] },
                            then: page - 1,
                            else: null,
                        },
                    },
                    nextPage: {
                        $cond: {
                            if: { $lt: ['$page', '$totalPages'] },
                            then: page + 1,
                            else: null,
                        },
                    },
                },
            },
            {
                $addFields: {
                    hasPrevPage: { $ne: ['$prevPage', null] },
                    hasNextPage: { $ne: ['$nextPage', null] },
                },
            },
        ];
    }
}
