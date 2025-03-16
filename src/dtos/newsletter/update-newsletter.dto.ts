// src/dtos/update-newsletter.dto.ts
export interface UpdateNewsletterDto {
    id: string; // MongoId
    // Newsletter의 나머지 필드 (title, mailTitle, template, urls, lastSendDate 등)를 optional
    title?: string;
    mailTitle?: string;
    template?: number;
    urls?: string[];
    lastSendDate?: Date;
}
