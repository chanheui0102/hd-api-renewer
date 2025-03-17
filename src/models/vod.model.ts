// src/models/vod.model.ts
import { model, Schema, Document } from 'mongoose';

export interface Attachment {
    originalname: string;
    key: string;
}

const AttachmentSchema = new Schema<Attachment>(
    {
        originalname: { type: String },
        key: { type: String },
    },
    { _id: false, versionKey: false }
);

export interface Answer {
    answer: string;
    rawAnswer: string;
    answererId: string;
    role: string; // 'RHQ'|'dotyadmin'|'HQ'
    createdAt: Date;
    updateAt: Date;
}

const AnswerSchema = new Schema<Answer>(
    {
        answer: { type: String },
        rawAnswer: { type: String },
        answererId: { type: String },
        role: { type: String, enum: ['RHQ', 'dotyadmin', 'HQ'] },
        createdAt: { type: Date },
        updateAt: { type: Date },
    },
    { _id: true, versionKey: false }
);

export interface VodUser {
    region: string;
    dealer: string;
    jobPosition: string;
    firstName: string;
    lastName: string;
    nickname: string;
    iso2: string;
    country: string;
    email: string;
    name: string; // e.g. firstName + ' ' + lastName
}

const VodUserSchema = new Schema<VodUser>(
    {
        region: { type: String },
        dealer: { type: String },
        jobPosition: { type: String },
        firstName: { type: String },
        lastName: { type: String },
        nickname: { type: String },
        iso2: { type: String },
        country: { type: String },
        email: { type: String },
        name: { type: String },
    },
    { _id: false, versionKey: false }
);

interface Log {
    passTime?: Date;
    hiddenTime?: Date;
    answerTime?: Date;
}

const LogSchema = new Schema<Log>(
    {
        passTime: { type: Date, default: null },
        hiddenTime: { type: Date, default: null },
        answerTime: { type: Date, default: null },
    },
    { _id: false, versionKey: false }
);

export type VodResponse = 'Done' | 'Processing';
export type VodStatus = 'Pass' | 'Hidden' | 'Pending';

export interface VodDocument extends Document {
    userId: string;
    user: VodUser;
    category: string;
    title: string;
    content: string;
    rawContent: string;
    attachments: Attachment[];
    log: Log;
    answers: Answer[];
    answererId?: string;
    response: VodResponse;
    status: VodStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

const VodSchema = new Schema<VodDocument>(
    {
        userId: { type: String, required: true },
        user: { type: VodUserSchema, required: true },
        category: { type: String, required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        rawContent: { type: String, required: true },
        attachments: { type: [AttachmentSchema], default: [] },
        log: { type: LogSchema },
        answers: { type: [AnswerSchema], default: [] },
        answererId: { type: String },
        response: {
            type: String,
            enum: ['Done', 'Processing'],
            default: 'Processing',
        },
        status: {
            type: String,
            enum: ['Pass', 'Hidden', 'Pending'],
            default: 'Pending',
        },
    },
    { timestamps: true, versionKey: false }
);

// optional: pagination plugin if needed
// VodSchema.plugin(mongoosePaginate);

export const VodModel = model<VodDocument>('Vod', VodSchema);
