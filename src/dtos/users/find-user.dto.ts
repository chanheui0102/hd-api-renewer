// src/dtos/find-user.dto.ts
export interface FindUserDto {
    begin: string; // or Date
    end: string; // or Date
    page: number;
    limit: number;
    iso2: string;
    region: string;
    status: string;
    orderBy?: 'asc' | 'desc';
    name?: string;
    nickname?: string;
}
