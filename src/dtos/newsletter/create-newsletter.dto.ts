// src/dtos/create-newsletter.dto.ts

// Multer에서 올라오는 파일 객체를 표현 (Express.Multer.File)
export interface CreateNewsletterFileDto {
    arabic: Express.Multer.File[];
    spanish: Express.Multer.File[];
    thai: Express.Multer.File[];
    vietnamese: Express.Multer.File[];
    indonesian: Express.Multer.File[];
    chinese: Express.Multer.File[];
    czech: Express.Multer.File[];
    german: Express.Multer.File[];
    french: Express.Multer.File[];
    hungarian: Express.Multer.File[];
    english: Express.Multer.File[];
}

export interface CreateNewsletterDto {
    // Newsletter의 프로퍼티 중 _id, createdAt, updatedAt, images 제외
    title: string;
    mailTitle: string;
    template: number; // e.g. 1 or 2
    urls: string[]; // array of URLs
    lastSendDate?: Date; // optional, if needed
}
