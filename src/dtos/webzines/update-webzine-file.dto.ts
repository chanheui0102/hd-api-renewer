// src/dtos/update-webzine-file.dto.ts

// NestJS의 enum, IsIn(...)을 Express에서는 직접 검증하던지, class-validator 쓸 수도 있음.
// 여기서는 단순 타입으로만 표시
export type FileType = 'pdf' | 'thumbnail';
export type LanguageType = 'en' | 'es';

export interface UpdateWebzineFileDto {
  fileType: FileType;         // "pdf" or "thumbnail"
  languageType: LanguageType; // "en" or "es"
}
