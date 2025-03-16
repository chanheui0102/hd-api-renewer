// src/models/user.model.ts
import { model, Schema, Document } from 'mongoose';

export interface UserDocument extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    nickname: string;
    jobPosition: string;
    region: string;
    country: string;
    iso2: string;
    role: string; // 'user' | 'admin' | 'dotyadmin'
    active: boolean;
    verified: boolean;
    lastLoginDate?: Date;
    status: string; // 'General' | 'Doty Owner' | ...
    dealer: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema = new Schema<UserDocument>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        firstName: { type: String, default: 'firstName' },
        lastName: { type: String, default: 'lastName' },
        nickname: {
            type: String,
            default: 'unknown',
            // match: /^[A-Za-z0-9]{1}[A-Za-z0-9\s]{1,14}$/,
        },
        jobPosition: { type: String, required: true },
        region: { type: String, required: true },
        country: { type: String },
        iso2: { type: String },
        role: { type: String, default: 'user' },
        active: { type: Boolean, default: true },
        verified: { type: Boolean, default: false },
        lastLoginDate: { type: Date },
        status: { type: String, default: 'General' },
        dealer: { type: String, default: 'unknown' },
    },
    {
        versionKey: false,
        timestamps: true, // createdAt, updatedAt 자동 처리
    }
);

// plugin(mongoosePaginate) 등 추가 가능
// UserSchema.plugin(mongoosePaginate);

export const UserModel = model<UserDocument>('User', UserSchema);
