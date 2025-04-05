// src/models/webzine.model.ts
import mongoose from 'mongoose';
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
// =====================
// 1) Pdf / Thumbnail
// =====================
export interface Pdf {
    en: string;
    es: string;
}

export interface Thumbnail {
    en: string;
    es: string;
}

// =====================
// 2) Comment
// =====================
// 댓글 정보에 대한 인터페이스
export interface Comment {
    _id?: mongoose.Schema.Types.ObjectId; // Mongoose가 ObjectId로 자동 생성
    content: string;
    nickname: string;
    password: string;
    recommends: any[]; // 추천 정보 (타입 확정 시 세부 타입 지정)
    visible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// =====================
// 3) Article
// =====================
// 아티클 정보에 대한 인터페이스
export interface Article {
    _id?: mongoose.Schema.Types.ObjectId; // Mongoose가 ObjectId로 자동 생성
    webzineId: string;
    title: {
        en: string;
        es: string;
    };
    content: {
        en: string;
        es: string;
    };
    category: string;
    thumbnail: {
        normal: string;
        wide: string;
    };
    views: {
        ip: string;
        createdAt: Date;
    }[];
    recommends: any[];
    comments: Comment[];
    beginPage: number;
    endPage: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface WebzineDocument extends mongoose.Document {
    pdf: Pdf;
    thumbnail: Thumbnail;
    articles: any[]; // 실제 Article 타입으로
    publishedDate: string; // e.g. "Mar.2023"
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose Schema
const PdfSchema = new mongoose.Schema<Pdf>({
    en: { type: String, required: true },
    es: { type: String, required: true },
});
const ThumbnailSchema = new mongoose.Schema<Thumbnail>({
    en: { type: String, required: true },
    es: { type: String, required: true },
});

// ---------------------
// commentSchema
// ---------------------
const CommentSchema = new mongoose.Schema<Comment>({
    _id: mongoose.Schema.Types.ObjectId, // _id 필드 명시적 정의
    content: String,
    nickname: String,
    password: String,
    recommends: [String],
    visible: Boolean,
    createdAt: Date,
    updatedAt: Date,
});

// ---------------------
// articleSchema
// ---------------------
const ArticleSchema = new mongoose.Schema<Article>({
    _id: mongoose.Schema.Types.ObjectId,
    webzineId: String,
    title: {
        en: String,
        es: String,
    },
    content: {
        en: String,
        es: String,
    },
    category: String,
    thumbnail: {
        normal: String,
        wide: String,
    },
    views: [
        {
            ip: String,
            createdAt: Date,
        },
    ],
    recommends: [String],
    comments: [CommentSchema], // CommentSchema 사용
    beginPage: Number,
    endPage: Number,
    createdAt: Date,
    updatedAt: Date,
});

const WebzineSchema = new mongoose.Schema<WebzineDocument>({
    pdf: { type: PdfSchema, required: true },
    thumbnail: { type: ThumbnailSchema, required: true },
    articles: [ArticleSchema],
    publishedDate: {
        type: String,
        unique: true,
        required: true,
        match: /^[A-Za-z]{3}\.\d{4}$/,
    },
    createdAt: { type: Date },
    updatedAt: { type: Date },
});

// 플러그인
WebzineSchema.plugin(mongoosePaginate);

// Model 생성
export const WebzineModel = mongoose.model<WebzineDocument>(
    'Webzines',
    WebzineSchema,
    'webzines'
);
