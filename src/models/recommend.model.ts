// src/models/recommend.model.ts
import { model, Schema, Document } from 'mongoose';
import { ViewDocument } from './view.model';

// Recommend가 View를 상속했던 구조 → Mongoose에서는 상속 대신 스키마 병합
export interface RecommendDocument extends Document {
    ip: string;
    createdAt: Date;
    // ... any additional fields
}

// 여기서는 RecommendSchema = ViewSchema 형태
// 만약 Recommend에 추가 필드가 없다면, 그냥 ViewSchema 복사해서 써도 됨
const RecommendSchema = new Schema<RecommendDocument>(
    {
        ip: { type: String, required: true },
        createdAt: { type: Date, required: true },
    },
    {
        autoIndex: true,
        _id: false,
        versionKey: false,
    }
);

export const RecommendModel = model<RecommendDocument>(
    'Recommend',
    RecommendSchema
);
