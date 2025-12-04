// src/services/article.service.ts
import mongoose from 'mongoose';
import { WebzineModel } from '../models/webzine.model';
import { FileService } from '../services/file.service';
import { ViewService } from '../services/view.service';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { PipelineStage } from 'mongoose';

export class ArticleService {
    private fileService: FileService;
    private viewService: ViewService;
    private AWS_S3_CDN: string;

    constructor() {
        this.fileService = new FileService();
        this.viewService = new ViewService();
        this.AWS_S3_CDN = process.env.AWS_S3_CDN || '';
    }

    private getArticleProjection() {
        return {
            $map: {
                input: '$articles',
                as: 'article',
                in: {
                    _id: '$$article._id',
                    webzineId: '$$article.webzineId',
                    category: '$$article.category',
                    title: '$$article.title',
                    content: '$$article.content',
                    createdAt: '$$article.createdAt',
                    updatedAt: '$$article.updatedAt',
                    beginPage: '$$article.beginPage',
                    endPage: '$$article.endPage',
                    thumbnail: {
                        normal: {
                            $concat: [
                                this.AWS_S3_CDN,
                                '/',
                                '$publishedDate',
                                '/thumbnail/',
                                '$$article.category',
                                '/',
                                '$$article.thumbnail.normal',
                            ],
                        },
                        wide: {
                            $concat: [
                                this.AWS_S3_CDN,
                                '/',
                                '$publishedDate',
                                '/thumbnail/',
                                '$$article.category',
                                '/',
                                '$$article.thumbnail.wide',
                            ],
                        },
                    },
                    viewCount: { $size: '$$article.views' },
                    recommendCount: { $size: '$$article.recommends' },
                    commentCount: { $size: '$$article.comments' },
                    recommended: false,
                    views: '$$article.views',
                    recommends: '$$article.recommends',
                    comments: '$$article.comments',
                },
            },
        };
    }

    public async upload(
        webzineId: string,
        dto: any, // CreateArticleDto
        files: { Thumbnail: Express.Multer.File[] }
    ) {
        const webzine = await WebzineModel.findById(webzineId, {
            publishedDate: 1,
        });
        if (!webzine) throw new Error('Webzine not found');

        // publishedDate
        const { publishedDate } = webzine;
        // S3 업로드 예시
        for (const file of files.Thumbnail) {
            file.originalname = `${uuidv4()}.${file.originalname
                .split('.')
                .pop()}`;
            await this.fileService.uploadArticle(
                publishedDate,
                'thumbnail',
                dto.category,
                file.originalname,
                file.buffer
            );
        }

        const now = moment().toDate();
        const article = {
            ...dto,
            webzineId,
            thumbnail: {
                normal: files.Thumbnail[0].originalname,
                wide: files.Thumbnail[1]?.originalname,
            },
            views: [],
            recommends: [],
            comments: [],
            createdAt: dto.createdAt || now,
            updatedAt: now,
        };

        return WebzineModel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(webzineId) },
            {
                $push: {
                    articles: article,
                },
            },
            { new: true }
        );
    }

    public async findById(ip: string, id: string) {
        console.log(`[ArticleService.findById] IP: ${ip}, Article ID: ${id}`);
        await this.viewService.view(id, ip);
        const pipeline: PipelineStage[] = [
            {
                $project: {
                    articles: {
                        $filter: {
                            input: '$articles',
                            as: 'sub',
                            cond: {
                                $eq: [
                                    '$$sub._id',
                                    new mongoose.Types.ObjectId(id),
                                ],
                            },
                        },
                    },
                    publishedDate: 1,
                },
            },
            {
                $project: {
                    articles: this.getArticleProjection(),
                },
            },
            { $unwind: '$articles' },
            { $replaceRoot: { newRoot: '$articles' } },
        ];

        const docs = await WebzineModel.aggregate(pipeline);
        if (!docs.length) throw new Error('Article not found');
        return docs[0];
    }

    public findByTitle(title?: string) {
        const pipeline: PipelineStage[] = [
            {
                $match: {
                    $or: [
                        {
                            'articles.title.en': {
                                $regex: title || '',
                                $options: 'i',
                            },
                        },
                        {
                            'articles.title.es': {
                                $regex: title || '',
                                $options: 'i',
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    articles: {
                        $filter: {
                            input: '$articles',
                            as: 'sub',
                            cond: {
                                $and: [
                                    {
                                        $or: [
                                            {
                                                $regexMatch: {
                                                    input: '$$sub.title.en',
                                                    regex: title || '',
                                                    options: 'i',
                                                },
                                            },
                                            {
                                                $regexMatch: {
                                                    input: '$$sub.title.es',
                                                    regex: title || '',
                                                    options: 'i',
                                                },
                                            },
                                        ],
                                    },
                                    { $ne: ['$$sub.category', 'Header'] },
                                ],
                            },
                        },
                    },
                    publishedDate: 1,
                },
            },
            {
                $project: {
                    articles: this.getArticleProjection(),
                },
            },
            { $unwind: '$articles' },
            { $replaceRoot: { newRoot: '$articles' } },
        ];

        return WebzineModel.aggregate(pipeline);
    }

    public findByWebzine(webzineId: string) {
        const pipeline: PipelineStage[] = [
            { $match: { _id: new mongoose.Types.ObjectId(webzineId) } },
            {
                $project: {
                    articles: this.getArticleProjection(),
                    publishedDate: 1,
                },
            },
            { $unwind: '$articles' },
            { $replaceRoot: { newRoot: '$articles' } },
        ];

        return WebzineModel.aggregate(pipeline);
    }

    public findByCategory(category: string) {
        const pipeline: PipelineStage[] = [
            {
                $project: {
                    articles: {
                        $filter: {
                            input: '$articles',
                            as: 'sub',
                            cond: { $eq: ['$$sub.category', category] },
                        },
                    },
                    publishedDate: 1,
                    createdAt: 1,
                },
            },
            {
                $addFields: {
                    articles: {
                        $sortArray: {
                            input: '$articles',
                            sortBy: { beginPage: 1 },
                        },
                    },
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    articles: this.getArticleProjection(),
                },
            },
            { $unwind: '$articles' },
            { $replaceRoot: { newRoot: '$articles' } },
        ];

        return WebzineModel.aggregate(pipeline);
    }

    public async updateById(id: string, dto: any) {
        const now = moment().toDate();
        return WebzineModel.updateOne(
            { 'articles._id': new mongoose.Types.ObjectId(id) },
            {
                $set: {
                    'articles.$.updatedAt': now,
                    'articles.$.title': dto.title,
                    'articles.$.content': dto.content,
                    'articles.$.beginPage': dto.beginPage,
                    'articles.$.endPage': dto.endPage,
                    'articles.$.createdAt': dto.createdAt,
                },
            }
        );
    }

    public async updateThumbnail(
        id: string,
        dto: { type: string },
        thumbnail: Express.Multer.File
    ) {
        if (!thumbnail) throw new Error('No thumbnail file');
        thumbnail.originalname = `${uuidv4()}.${thumbnail.originalname
            .split('.')
            .pop()}`;

        // find the article's webzine first
        const webzine = await WebzineModel.findOne({
            'articles._id': new mongoose.Types.ObjectId(id),
        });
        if (!webzine) throw new Error('Article not found');
        const article = webzine.articles.find((a) => a._id.toString() === id);
        // this.fileService.uploadArticle(...)

        const now = moment().toDate();
        const update: any = {
            'articles.$.updatedAt': now,
        };
        if (dto.type === 'normal') {
            update['articles.$.thumbnail.normal'] = thumbnail.originalname;
        } else if (dto.type === 'wide') {
            update['articles.$.thumbnail.wide'] = thumbnail.originalname;
        }

        return WebzineModel.updateOne(
            { 'articles._id': new mongoose.Types.ObjectId(id) },
            { $set: update }
        );
    }

    public async deleteById(id: string) {
        return WebzineModel.updateOne(
            { 'articles._id': new mongoose.Types.ObjectId(id) },
            {
                $pull: {
                    articles: { _id: new mongoose.Types.ObjectId(id) },
                },
            }
        );
    }
}
