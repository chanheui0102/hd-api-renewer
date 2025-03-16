// src/services/newsletter.service.ts
import mongoose from 'mongoose';
import moment from 'moment';
import dotenv from 'dotenv';
import {
    NewsletterModel,
    NewsletterDocument,
    NewsletterImage,
} from '../models/newsletter.model';
import { NewsletterLogModel } from '../models/newsletter-log.model';
import { FileService } from './file.service';
import { RedisService } from './redis.service'; // or your own
// etc.

dotenv.config();

export class NewsletterService {
    private cdnBase: string;
    private fileService: FileService;
    private redisService: RedisService;
    // etc. other injections

    constructor() {
        this.cdnBase = process.env.AWS_S3_CDN || '';
        this.fileService = new FileService();
        this.redisService = new RedisService();
        // ...
    }

    public async create(dto: any, fileDto: any) {
        // dto: CreateNewsletterDto
        // fileDto: CreateNewsletterFileDto
        try {
            const doc = await NewsletterModel.create({
                title: dto.title,
                mailTitle: dto.mailTitle,
                template: dto.template,
                urls: dto.urls,
                images: Object.keys(fileDto).map((lang) => ({
                    language: lang,
                    originalname: fileDto[lang][0].originalname,
                })),
            });
            // upload HTML, upload posters
            await this.uploadPosters(doc._id.toString(), fileDto);
            await this.uploadHtml(doc._id.toString(), this.generateHTML(doc));

            return doc;
        } catch (err) {
            throw new Error('Could not create newsletter');
        }
    }

    public async findAll(params: {
        page: number;
        limit: number;
        orderBy?: 'asc' | 'desc';
    }) {
        const { page, limit, orderBy } = params;
        // pipeline, or simpler .find() + .sort() + .skip() + .limit()

        const sortDir = orderBy === 'asc' ? 1 : -1;
        // example
        const docs = await NewsletterModel.find()
            .sort({ createdAt: sortDir })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        // optional: total count
        const totalDocs = await NewsletterModel.countDocuments().exec();
        // build pagination object
        return {
            docs,
            totalDocs,
            limit,
            page,
            // etc.
        };
    }

    public async findById(id: string) {
        const doc = await NewsletterModel.findById(id).lean().exec();
        if (!doc) throw new Error('Newsletter not found');
        // transform images => add url
        const images = doc.images.map((image) => {
            const splitted = image.originalname.split('.');
            const ext = splitted[splitted.length - 1] || 'jpg';
            return {
                ...image,
                url: `${this.cdnBase}/newsletter/${doc._id}/static/${image.language}.${ext}`,
            };
        });
        return { ...doc, images };
    }

    public async send(dto: { id: string }) {
        // send-newsletter
        await this.redisService.pub('send-newsletter', JSON.stringify(dto));
        const doc = await NewsletterModel.findByIdAndUpdate(
            dto.id,
            { $set: { lastSendDate: new Date() } },
            { new: true }
        );
        return doc;
    }

    public async update(dto: any, fileDto: any) {
        const newsletter = await NewsletterModel.findById(dto.id).exec();
        if (!newsletter) throw new Error('Newsletter not found');

        // update images if new files
        for (const lang of Object.keys(fileDto)) {
            const { originalname } = fileDto[lang][0];
            const found = newsletter.images.findIndex(
                (img) => img.language === lang
            );
            if (found >= 0) {
                newsletter.images[found].originalname = originalname;
            }
        }
        // upload new files
        await this.uploadPosters(newsletter._id.toString(), fileDto);
        // re-generate HTML
        await this.uploadHtml(
            newsletter._id.toString(),
            this.generateHTML(newsletter)
        );

        // update other fields
        newsletter.urls = dto.urls || newsletter.urls;
        newsletter.mailTitle = dto.mailTitle || newsletter.mailTitle;
        newsletter.title = dto.title || newsletter.title;
        newsletter.updatedAt = new Date();
        await newsletter.save();

        return newsletter;
    }

    public async delete(id: string) {
        const res = await NewsletterModel.deleteOne({
            _id: new mongoose.Types.ObjectId(id),
        });
        // also remove S3 folder?
        await this.fileService.deleteFolder(`newsletter/${id}`);
        return res;
    }

    public async visit(ip: string, dto: any) {
        // dto: { articleId }
        // find webzine => check redis => create newsletterLog
        // ...
        return true;
    }

    public async findVisitor() {
        // return NewsletterLogModel.find()
        return NewsletterLogModel.find().exec();
    }

    // Helper methods

    private async uploadPosters(newsletterId: string, fileDto: any) {
        // e.g. "newsletter/{id}/static/{lang}.ext"
        const tasks = Object.keys(fileDto).map((lang) => {
            const originalname = fileDto[lang][0].originalname;
            const splitted = originalname.split('.');
            const ext = splitted[splitted.length - 1] || 'jpg';
            const path = `newsletter/${newsletterId}/static/${lang}.${ext}`;
            const buffer = fileDto[lang][0].buffer;

            return this.fileService.upload(path, buffer);
        });
        await Promise.all(tasks);
    }

    private generateHTML(
        doc: NewsletterDocument
    ): Array<{ language: string; buffer: Buffer }> {
        // doc.template => 1 or 2 => return array of { language, buffer }
        // For each language in doc.images, create HTML
        const templateCoords = new Map<number, string[]>([
            [1, ['... coords set 1 ...']],
            [2, ['... coords set 2 ...']],
        ]);

        return doc.images.map((img) => {
            const splitted = img.originalname.split('.');
            const ext = splitted[splitted.length - 1] || 'jpg';
            const imageUrl = `${this.cdnBase}/newsletter/${doc._id}/static/${img.language}.${ext}`;
            // build HTML string
            const coords = templateCoords.get(doc.template) || [];
            const html = `<!DOCTYPE html> ... <img usemap="#map" src="${imageUrl}" /> ...`;

            const buffer = Buffer.from(html, 'utf8');
            return { language: img.language, buffer };
        });
    }

    private async uploadHtml(
        newsletterId: string,
        htmls: Array<{ language: string; buffer: Buffer }>
    ) {
        const tasks = htmls.map(({ language, buffer }) => {
            const path = `newsletter/${newsletterId}/${language}.html`;
            return this.fileService.upload(path, buffer);
        });
        await Promise.all(tasks);
    }
}
