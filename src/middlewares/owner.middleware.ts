// src/middlewares/owner.middleware.ts
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { WebzineModel } from '../models/webzine.model';

interface RequestWithUser extends Request {
    user?: { id: string };
}

export async function ownerMiddleware(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) {
    try {
        const { articleId, commentId } = req.body;
        const user = req.user; // JWT 미들웨어로부터 세팅된 값 가정
        if (!commentId || !articleId || !user) {
            return res.status(400).json({ message: 'Missing fields' });
        }

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
                            as: 'comment',
                            cond: {
                                $eq: [
                                    '$$comment._id',
                                    new mongoose.Types.ObjectId(commentId),
                                ],
                            },
                        },
                    },
                },
            },
            { $unwind: '$comments' },
            { $replaceRoot: { newRoot: '$comments' } },
        ];

        const docs = await WebzineModel.aggregate(pipeline);
        if (!docs.length) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const comment = docs[0];
        if (comment.userId !== user.id) {
            return res.status(403).json({ message: 'Not the owner' });
        }

        // 통과
        next();
    } catch (err) {
        console.error(err);
        return res.status(403).json({ message: 'Forbidden' });
    }
}
