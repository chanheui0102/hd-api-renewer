// src/dtos/create-article.dto.ts

export interface CreateArticleDto {
    title: {
        en: string;
        es: string;
    };
    beginPage: number;
    endPage: number;
    content: {
        en: string;
        es: string;
    };
    category: string; // "Header", "Event", "Local News", ...
    createdAt?: Date;
}

// NestJS에서 Multer 파일을 받기 위해 썼던 CreateArticleFileDto
// Express에서는 multer로 직접 처리 가능하므로, 여기서는 단순 타입 정의
export interface CreateArticleFileDto {
    Thumbnail: Express.Multer.File[];
}
