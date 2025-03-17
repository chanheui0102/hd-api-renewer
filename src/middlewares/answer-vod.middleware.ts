// src/middlewares/answer-vod.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { VodModel } from '../models/vod.model'; // your Mongoose model
import { UserModel } from '../models/user.model'; // your Mongoose model

interface RequestWithUser extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        status: string;
    };
}

export async function answerVodMiddleware(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) {
    try {
        const user = req.user; // from JWT or other
        if (!user) {
            return res.status(401).json({ message: 'No user' });
        }
        const { id, answer, rawAnswer } = req.body; // AnswerVodDto
        // findOne({ _id: id, status: 'Pass', response: 'Processing' })
        const vod = await VodModel.findOne({
            _id: id,
            status: 'Pass',
            response: 'Processing',
        }).exec();
        if (!vod) {
            return res
                .status(403)
                .json({ message: 'Not found or not allowed' });
        }
        if (vod.answers.length) {
            // already answered
            return res.status(403).json({ message: 'Already answered' });
        }

        // if user.status === 'HQ', allow
        if (user.status === 'HQ') {
            return next();
        } else {
            const userDoc = await UserModel.findById(user.id).exec();
            if (!userDoc) {
                return res.status(403).json({ message: 'No user doc' });
            }
            // region check
            if (vod.user.region === userDoc.region) {
                return next();
            }
            return res.status(403).json({ message: 'region mismatch' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
}
