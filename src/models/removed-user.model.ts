// src/models/removed-user.model.ts
import { model, Schema, Document } from 'mongoose';

export interface RemovedUserDocument extends Document {
    email: string;
    nickname: string;
    deletedAt: Date;
    deletedBy: 'me' | 'admin';
    reason: string;
}

const RemovedUserSchema = new Schema<RemovedUserDocument>(
    {
        email: { type: String, required: true },
        nickname: { type: String },
        deletedAt: { type: Date },
        deletedBy: { type: String },
        reason: { type: String },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

export const RemovedUserModel = model<RemovedUserDocument>(
    'RemovedUser',
    RemovedUserSchema
);
