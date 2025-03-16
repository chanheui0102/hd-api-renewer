// src/dtos/create-webzine.dto.ts

// NestJS에서는 PickType(Webzine, ['publishedDate']) 등을 썼지만,
// Express에서는 단순히 아래처럼 인터페이스/클래스로 정의합니다.

export interface CreateWebzineDto {
    publishedDate: string; // "Mar.2023" 형태 등
}

// NestJS에서 파일 업로드(Thumbnail, Pdf) 관련 데코레이터를 썼지만,
// Express에서는 multer로 처리하므로, 아래는 단순 타입으로만.
import { Express } from 'express';

export interface CreateWebzineFileDto {
    Thumbnail: Express.Multer.File[];
    Pdf: Express.Multer.File[];
}
