// src/services/vod.service.ts
import { VodModel } from '../models/vod.model';
import { UserModel } from '../models/user.model';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { FileService } from './file.service';
import { RedisService } from './redis.service';
import { MongodbPipelineService } from './mongodb-pipeline.service';

interface VodAttachment {
    key: string;
    originalname: string;
}

export class VodService {
    private fileService: FileService;
    private redisService: RedisService;
    private mpService: MongodbPipelineService;

    constructor() {
        this.fileService = new FileService();
        this.redisService = new RedisService();
        this.mpService = new MongodbPipelineService();
    }

    public async create(userId: string, dto: any) {
        const { attachments, title, content, category, rawContent } = dto;
        const userDoc = await UserModel.findById(userId);
        if (!userDoc) throw new Error('No user doc found');

        const now = moment().format('YYYY-MM-DD');
        const attachmentArray: VodAttachment[] = [];
        for (const file of attachments) {
            const originalname = file.originalname;
            file.originalname = `${uuidv4()}.${originalname.split('.').pop()}`;
            const key = `vod/${userDoc.region}/${now}/${file.originalname}`;
            await this.fileService.uploadVodAttachment(key, file.buffer);
            attachmentArray.push({
                key,
                originalname,
            });
        }

        const newVod = await VodModel.create({
            attachments: attachmentArray,
            content,
            rawContent,
            title,
            category,
            user: {
                email: userDoc.email,
                dealer: userDoc.dealer,
                firstName: userDoc.firstName,
                lastName: userDoc.lastName,
                name: `${userDoc.firstName} ${userDoc.lastName}`,
                region: userDoc.region,
                jobPosition: userDoc.jobPosition,
                nickname: userDoc.nickname,
                iso2: userDoc.iso2,
            },
            userId,
        });
        // redis publish
        await this.redisService.pub('create-vod', JSON.stringify(newVod));
        return newVod;
    }

    public async find(query: any) {
        const {
            begin,
            end,
            limit,
            page,
            iso2,
            region,
            sort,
            category,
            response,
            status,
            search,
        } = query;
        // build aggregator/paginate
        // or use VodModel.find(...) + skip/limit
    }

    public async findById(me: any, id: string) {
        // aggregator
        const docs = await VodModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                },
            },
            {
                $addFields: {
                    attachments: {
                        $map: {
                            input: '$attachments',
                            as: 'attachment',
                            in: {
                                originalname: '$$attachment.originalname',
                                url: {
                                    $concat: [
                                        process.env.DOTY_AWS_S3_CDN || '',
                                        '/',
                                        '$$attachment.key',
                                    ],
                                },
                            },
                        },
                    },
                    answers: {
                        $sortArray: {
                            input: '$answers',
                            sortBy: { createdAt: -1 },
                        },
                    },
                },
            },
            {
                $addFields: {
                    answer: { $first: '$answers' },
                    history: {
                        $cond: {
                            if: { $gte: [{ $size: '$answers' }, 2] },
                            then: {
                                $slice: ['$answers', 1, { $size: '$answers' }],
                            },
                            else: [],
                        },
                    },
                },
            },
            {
                $project: {
                    answers: 0,
                },
            },
        ]);
        if (!docs.length) return null;
        const vod = docs[0];
        // check permission: if userId, or role=dotyadmin, or user.status=HQ, ...
        // else if user.status=RHQ -> region check...
        return vod;
    }

    public async findByHq(me: any, query: any) {
        // see original aggregator with $and
        // region check if me.status=== 'RHQ'
    }

    public async findByOwner(userId: string, query: any) {
        // aggregator with match { userId }
    }

    public async pass(id: string) {
        // findOneAndUpdate
        const now = new Date();
        const updated = await VodModel.findOneAndUpdate(
            {
                _id: id,
                response: 'Processing',
                status: 'Pending',
            },
            {
                $set: {
                    status: 'Pass',
                    'log.passTime': now,
                },
            },
            { new: true }
        );
        if (!updated) throw new Error('No doc found');
        await this.redisService.pub('pass-vod', JSON.stringify(updated));
        return updated;
    }

    public async hide(me: any, dto: any) {
        const now = new Date();
        const answer = {
            answer: dto.answer,
            rawAnswer: dto.rawAnswer,
            answererId: me.id,
            role: me.role,
            createdAt: now,
            updateAt: now,
        };
        const updated = await VodModel.findOneAndUpdate(
            {
                _id: dto.id,
                response: 'Processing',
            },
            {
                $set: {
                    answererId: me.id,
                    response: 'Done',
                    status: 'Hidden',
                    'log.hiddenTime': now,
                },
                $push: {
                    answers: answer,
                },
            },
            { new: true }
        );
        if (!updated) throw new Error('Not found or update fail');
        await this.redisService.pub('answer-vod', JSON.stringify(updated));
        return updated;
    }

    public async answer(me: any, dto: any) {
        const now = new Date();
        const answer = {
            answer: dto.answer,
            rawAnswer: dto.rawAnswer,
            answererId: me.id,
            role: me.status,
            createdAt: now,
            updateAt: now,
        };
        const updated = await VodModel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(dto.id) },
            {
                $set: {
                    answererId: me.id,
                    response: 'Done',
                    'log.answerTime': now,
                },
                $push: {
                    answers: answer,
                },
            },
            { new: true }
        );
        if (!updated) throw new Error('No doc found or update fail');
        await this.redisService.pub('answer-vod', JSON.stringify(updated));
        return updated;
    }

    public async modifyAnswer(me: any, dto: any) {
        const now = new Date();
        const answer = {
            answer: dto.answer,
            rawAnswer: dto.rawAnswer,
            answererId: me.id,
            role: me.role,
            createdAt: now,
            updateAt: now,
        };
        await VodModel.updateOne(
            {
                _id: new mongoose.Types.ObjectId(dto.vodId),
            },
            {
                $push: { answers: answer },
            }
        );
        return this.getDetail(dto.vodId);
    }

    public async delete(userId: string, id: string) {
        // findOne => delete attachments from S3 => deleteOne
        const vod = await VodModel.findOne({ _id: id, userId }).exec();
        if (!vod) throw new Error('no doc or no permission');
        for (const attachment of vod.attachments) {
            await this.fileService.deleteByKey(attachment.key);
        }
        return VodModel.deleteOne({ _id: id, userId }).exec();
    }

    private async getDetail(id: string) {
        // aggregator
        const docs = await VodModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                },
            },
            {
                $addFields: {
                    attachments: {
                        $map: {
                            input: '$attachments',
                            as: 'attachment',
                            in: {
                                originalname: '$$attachment.originalname',
                                url: {
                                    $concat: [
                                        process.env.DOTY_AWS_S3_CDN || '',
                                        '/',
                                        '$$attachment.key',
                                    ],
                                },
                            },
                        },
                    },
                    answers: {
                        $sortArray: {
                            input: '$answers',
                            sortBy: { createdAt: -1 },
                        },
                    },
                },
            },
            {
                $addFields: {
                    answer: { $first: '$answers' },
                    history: {
                        $cond: {
                            if: { $gte: [{ $size: '$answers' }, 2] },
                            then: {
                                $slice: ['$answers', 1, { $size: '$answers' }],
                            },
                            else: [],
                        },
                    },
                },
            },
            { $project: { answers: 0 } },
        ]);
        if (!docs.length) return null;
        return docs[0];
    }
}
