// src/models/log.model.ts
import { model, Schema, Document } from 'mongoose';

export interface LogDocument extends Document {
    userId: string; // MongoId
    createdAt: number;
}

const LogSchema = new Schema<LogDocument>(
    {
        userId: { type: String, required: true },
        createdAt: { type: Number, default: 0 },
    },
    {
        autoIndex: true,
        versionKey: false,
    }
);

export const LogModel = model<LogDocument>('Log', LogSchema);
