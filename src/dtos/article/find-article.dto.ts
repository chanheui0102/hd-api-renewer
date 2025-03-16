// src/dtos/find-article.dto.ts

// NestJS에서 FindByCategoryDto 등 작성했다면, Express에서는 단순히 category:string 검사
export interface FindByCategoryDto {
    category: string;
}
