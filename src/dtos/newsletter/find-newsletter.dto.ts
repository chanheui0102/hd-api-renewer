// src/dtos/find-newsletter.dto.ts
export interface FindNewsletterDto {
    page: number; // e.g. >= 1
    limit: number; // e.g. >= 1
    orderBy?: 'asc' | 'desc';
}
