// src/dtos/find-pagination.dto.ts
export interface FindPaginationDto {
    page: number;
    limit: number;
}

// Express에서 간단 검증 예시
export function validateFindPaginationDto(dto: any): FindPaginationDto {
    const page = parseInt(dto.page, 10);
    const limit = parseInt(dto.limit, 10);
    if (isNaN(page) || page < 1) {
        throw new Error('page must be >= 1');
    }
    if (isNaN(limit) || limit < 1) {
        throw new Error('limit must be >= 1');
    }
    return { page, limit };
}
