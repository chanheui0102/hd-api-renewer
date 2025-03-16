// src/dtos/delete-users.dto.ts
export interface DeleteUsersDto {
    ids: string[]; // 1~15 길이 배열
    reason: string; // 최대 100자
}
