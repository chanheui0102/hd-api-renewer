// src/models/subscriber.model.ts
import { model, Schema, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface SubscriberDocument extends Document {
    email: string;
    firstName: string;
    lastName: string;
    language: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const SubscriberSchema = new Schema<SubscriberDocument>(
    {
        email: { type: String, unique: true, required: true },
        firstName: {
            type: String,
            required: true,
            default: 'firstName',
            // match: /^[A-Za-z가-힣0-9]{1}[A-Za-z0-9가-힣\s]{1,63}$/,
        },
        lastName: {
            type: String,
            required: true,
            default: 'lastName',
            // match: /^[A-Za-z가-힣0-9]{1}[A-Za-z0-9가-힣\s]{1,63}$/,
        },
        language: { type: String, default: 'english' },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

SubscriberSchema.plugin(mongoosePaginate);

export const SubscriberModel = model<SubscriberDocument>(
    'Subscriber',
    SubscriberSchema
);
