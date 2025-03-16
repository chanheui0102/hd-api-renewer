// src/models/refresh.model.ts
import { model, Schema, Document } from 'mongoose';

export interface RefreshDocument extends Document {
    refreshToken: string;
    accessToken: string;
    createdAt: number;
    userId: string;
}

const RefreshSchema = new Schema<RefreshDocument>(
    {
        refreshToken: { type: String, required: true },
        accessToken: { type: String, required: true },
        createdAt: { type: Number, default: Date.now },
        userId: { type: String, required: true },
    },
    {
        versionKey: false,
    }
);

// plugin(mongoosePaginate) 가능

export const RefreshModel = model<RefreshDocument>('Refresh', RefreshSchema);
