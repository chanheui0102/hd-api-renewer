// src/dtos/update-thumbnail.dto.ts

export type ThumbnailType = 'normal' | 'wide';

export interface UpdateThumbnailDto {
    type: ThumbnailType;
}
