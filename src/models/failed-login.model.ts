// src/models/failed-login.model.ts
import { model, Schema, Document } from 'mongoose';

export interface FailedLoginDocument extends Document {
    email: string;
    count: number;
}

const FailedLoginSchema = new Schema<FailedLoginDocument>(
    {
        email: { type: String, required: true },
        count: { type: Number, default: 0 },
    },
    { versionKey: false }
);

// plugin(mongoosePaginate) 가능

export const FailedLoginModel = model<FailedLoginDocument>(
    'FailedLogin',
    FailedLoginSchema
);
