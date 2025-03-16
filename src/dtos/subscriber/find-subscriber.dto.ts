// src/dtos/find-subscriber.dto.ts
export interface FindSubscriberDto {
    begin: string; // Nest에서 Date → 여기서는 string으로 받고 변환
    end: string;
    page: number;
    limit: number;
    search?: string;
}
