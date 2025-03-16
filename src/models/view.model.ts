// src/models/view.model.ts
import { model, Schema, Document } from 'mongoose';

export interface ViewDocument extends Document {
    ip: string;
    createdAt: Date;
}

const ViewSchema = new Schema<ViewDocument>(
    {
        ip: { type: String, required: true },
        createdAt: { type: Date, required: true },
    },
    {
        autoIndex: true,
        _id: false, // if you want sub-document style
        versionKey: false,
    }
);

export const ViewModel = model<ViewDocument>('View', ViewSchema);
