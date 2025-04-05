// src/services/comment.service.ts
import mongoose from 'mongoose';
import { WebzineModel } from '../models/webzine.model';
import moment from 'moment';
import bcrypt from 'bcrypt';
import { CreateCommentDto } from '../dtos/comment/create-commnent.dto';
import { UpdateCommentDto } from '../dtos/comment/update-comment.dto';
import { DeleteCommentDto } from '../dtos/comment/delete-comment.dto';
import { ValidateCommentPasswordDto } from '../dtos/comment/validate-comment-password.dto';

export class CommentService {
    // constructor() { ... } // 필요시 다른 서비스 주입

    public async findByArticle(id: string, page: number) {
        // pipeline
        const pipeline = [
            {
                $match: { 'articles._id': new mongoose.Types.ObjectId(id) },
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
                                    new mongoose.Types.ObjectId(id),
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
                    articleId: '$_id',
                    docs: {
                        $map: {
                            input: '$comments',
                            as: 'comment',
                            in: {
                                _id: '$$comment._id',
                                createdAt: '$$comment.createdAt',
                                updatedAt: '$$comment.updatedAt',
                                userId: '$$comment.userId',
                                content: '$$comment.content',
                                visible: '$$comment.visible',
                                nickname: '$$comment.nickname',
                                recommendCount: {
                                    $size: '$$comment.recommends',
                                },
                                recommended: false,
                            },
                        },
                    },
                },
            },
            // 정렬, 페이징 로직 (여기서는 생략 or 구현)
        ];

        const docs = await WebzineModel.aggregate(pipeline);
        if (docs.length) return docs[0];
        else return { docs: [] };
    }

    public async validatePassword(dto: ValidateCommentPasswordDto) {
        const { articleId, commentId, password } = dto;
        console.log('입력된 데이터:', { articleId, commentId, password });

        const pipeline = [
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
                            as: 'c',
                            cond: {
                                $eq: ['$$c._id', commentId], // ObjectId 변환 제거
                            },
                        },
                    },
                },
            },
            { $unwind: '$comments' },
            { $replaceRoot: { newRoot: '$comments' } },
        ];

        const docs = await WebzineModel.aggregate(pipeline);
        console.log('조회된 댓글:', docs);

        if (!docs.length) return false;

        const comment = docs[0];
        console.log('비밀번호 비교:', {
            입력비밀번호: password,
            저장된해시: comment.password,
        });

        return await bcrypt.compare(password, comment.password);
    }

    public async create(dto: CreateCommentDto) {
        const { content, articleId, nickname, password } = dto;
        const now = moment().toDate();
        const salt = bcrypt.genSaltSync(10);
        const newId = new mongoose.Types.ObjectId();

        // sub-doc
        const newComment = {
            _id: newId.toString(),
            content,
            nickname,
            password: bcrypt.hashSync(password, salt),
            recommends: [],
            visible: true,
            createdAt: now,
            updatedAt: now,
        };

        await WebzineModel.updateOne(
            { 'articles._id': new mongoose.Types.ObjectId(articleId) },
            {
                $push: {
                    'articles.$[article].comments': newComment,
                },
            },
            {
                arrayFilters: [
                    { 'article._id': new mongoose.Types.ObjectId(articleId) },
                ],
            }
        );
        // password 필드를 지워서 반환할 수도 있음
        const { password: _, ...returnComment } = newComment;
        return returnComment;
    }

    public async update(dto: UpdateCommentDto) {
        const { articleId, commentId, content, nickname } = dto;
        const now = moment().toDate();
        return WebzineModel.updateOne(
            { 'articles._id': new mongoose.Types.ObjectId(articleId) },
            {
                $set: {
                    'articles.$[article].comments.$[comment].updatedAt': now,
                    'articles.$[article].comments.$[comment].content': content,
                    'articles.$[article].comments.$[comment].nickname':
                        nickname,
                },
            },
            {
                arrayFilters: [
                    { 'article._id': new mongoose.Types.ObjectId(articleId) },
                    { 'comment._id': new mongoose.Types.ObjectId(commentId) },
                ],
            }
        );
    }

    public async delete(dto: DeleteCommentDto) {
        const { articleId, commentId } = dto;
        return WebzineModel.updateOne(
            { 'articles._id': new mongoose.Types.ObjectId(articleId) },
            {
                $pull: {
                    'articles.$[article].comments': {
                        _id: new mongoose.Types.ObjectId(commentId),
                    },
                },
            },
            {
                arrayFilters: [
                    {
                        'article._id': new mongoose.Types.ObjectId(articleId),
                    },
                ],
            }
        );
    }
}
