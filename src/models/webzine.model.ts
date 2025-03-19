// src/models/webzine.model.ts
import { model, Schema, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// interface
export interface Pdf {
    en: string;
    es: string;
}
export interface Thumbnail {
    en: string;
    es: string;
}

export interface WebzineDocument extends Document {
    pdf: Pdf;
    thumbnail: Thumbnail;
    articles: any[]; // 실제 Article 타입으로
    publishedDate: string; // e.g. "Mar.2023"
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose Schema
const PdfSchema = new Schema<Pdf>({
    en: { type: String, required: true },
    es: { type: String, required: true },
});
const ThumbnailSchema = new Schema<Thumbnail>({
    en: { type: String, required: true },
    es: { type: String, required: true },
});

const WebzineSchema = new Schema<WebzineDocument>(
    {
        pdf: { type: PdfSchema, required: true },
        thumbnail: { type: ThumbnailSchema, required: true },
        articles: [{ type: Schema.Types.Mixed }],
        publishedDate: {
            type: String,
            unique: true,
            required: true,
            match: /^[A-Za-z]{3}\.\d{4}$/,
        },
        createdAt: { type: Date },
        updatedAt: { type: Date },
    },
    {
        versionKey: false,
    }
);

// 플러그인
WebzineSchema.plugin(mongoosePaginate);

// Model 생성
export const WebzineModel = model<WebzineDocument>(
    'Webzines',
    WebzineSchema,
    'webzines' // 실제 컬렉션 이름 명시적 지정
);
