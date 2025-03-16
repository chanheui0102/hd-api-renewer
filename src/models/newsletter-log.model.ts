// src/models/newsletter-log.model.ts
import { model, Schema, Document } from 'mongoose';

export interface NewsletterLogDocument extends Document {
    webzineId: string;
    articleId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const NewsletterLogSchema = new Schema<NewsletterLogDocument>(
    {
        webzineId: { type: String, required: true },
        articleId: { type: String, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const NewsletterLogModel = model<NewsletterLogDocument>(
    'NewsletterLog',
    NewsletterLogSchema
);
