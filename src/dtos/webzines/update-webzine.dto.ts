// src/dtos/update-webzine.dto.ts

import * as moment from 'moment';
import { Express } from 'express';

// NestJS에서는 PartialType(CreateWebzineDto) + transform decorator를 썼지만,
// Express에서는 아래처럼 단순하게 interface로만 정의
export interface UpdateWebzineDto {
  publishedDate?: string; // optional
  createdAt?: Date;
}

// 만약 파일 업로드가 필요하다면:
export interface UpdateWebzineFileDto {
  thumbnail_en?: Express.Multer.File[];
  thumbnail_es?: Express.Multer.File[];
  pdf_en?: Express.Multer.File[];
  pdf_es?: Express.Multer.File[];
}

// transform/validation은 express-validator 등을 통해 라우트 레벨에서 처리 가능
