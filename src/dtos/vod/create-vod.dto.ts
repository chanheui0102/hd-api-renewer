// src/dtos/create-vod.dto.ts
export interface CreateVodDto {
    title: string;
    content: string;
    category: string;
    rawContent: string;
}

export interface CreateVodFileDto {
    attachments: Express.Multer.File[];
}
