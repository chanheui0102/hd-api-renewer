// src/models/newsletter.model.ts
import { model, Schema, Document } from 'mongoose';

export interface NewsletterImage {
    language: string; // 'arabic', 'spanish', etc.
    originalname: string;
}

export interface NewsletterDocument extends Document {
    title: string;
    mailTitle: string;
    template: number; // 1 or 2
    urls: string[];
    images: NewsletterImage[];
    lastSendDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const NewsletterImageSchema = new Schema<NewsletterImage>({
    language: { type: String, required: true },
    originalname: { type: String, required: true },
});

const NewsletterSchema = new Schema<NewsletterDocument>(
    {
        title: { type: String, required: true },
        mailTitle: { type: String, required: true },
        template: { type: Number, required: true },
        urls: [{ type: String, required: true }],
        images: { type: [NewsletterImageSchema], default: [] },
        lastSendDate: { type: Date },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// optional: pagination plugin
// NewsletterSchema.plugin(mongoosePaginate);

export const NewsletterModel = model<NewsletterDocument>(
    'Newsletter',
    NewsletterSchema
);
