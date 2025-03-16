// src/dtos/update-article.dto.ts

export interface UpdateArticleDto {
    title?: {
        en?: string;
        es?: string;
    };
    content?: {
        en?: string;
        es?: string;
    };
    beginPage?: number;
    endPage?: number;
    createdAt?: Date;
}

// NestJS에서 PartialType(CreateArticleFileDto)를 썼던 부분은
// 필요하다면 Express에서 별도 interface로
export interface UpdateArticleFileDto {
    Thumbnail?: Express.Multer.File[];
}
