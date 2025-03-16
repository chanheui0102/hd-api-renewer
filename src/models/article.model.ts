// src/models/article.model.ts
// (선택) 만약 Article를 별도 collection이 아닌 sub-document로만 사용한다면
// Webzine 스키마 안에서만 정의해도 됨.

import { Schema } from 'mongoose';

export const ArticleSubSchema = new Schema(
    {
        _id: { type: Schema.Types.ObjectId, auto: true },
        title: {
            en: { type: String, required: true },
            es: { type: String, required: true },
        },
        content: {
            en: { type: String, default: '' },
            es: { type: String, default: '' },
        },
        category: { type: String, required: true },
        thumbnail: {
            normal: { type: String },
            wide: { type: String },
        },
        beginPage: { type: Number, default: 1 },
        endPage: { type: Number, default: 1 },
        createdAt: { type: Date },
        updatedAt: { type: Date },
        // etc...
    },
    { _id: false, versionKey: false }
);
