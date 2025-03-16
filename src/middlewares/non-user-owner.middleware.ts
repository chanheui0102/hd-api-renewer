// src/middlewares/non-user-owner.middleware.ts
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { WebzineModel } from '../models/webzine.model'; // Mongoose model
import { ValidateCommentPasswordDto } from '../dtos/comment/validate-comment-password.dto';

async function validatePassword(
    articleId: string,
    commentId: string,
    password: string
): Promise<boolean> {
    const pipeline = [
        { $match: { 'articles._id': new mongoose.Types.ObjectId(articleId) } },
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
    if (!docs.length) return false;

    return bcrypt.compare(password, docs[0].password);
}

export async function nonUserOwnerMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { articleId, commentId, password } = req.body;
        if (!commentId || !articleId || !password) {
            res.status(400).json({ message: 'Missing fields' });
            return;
        }

        const isValid = await validatePassword(articleId, commentId, password);
        if (!isValid) {
            res.status(403).json({ message: 'Invalid password' });
            return;
        }

        next();
    } catch (err) {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
}
