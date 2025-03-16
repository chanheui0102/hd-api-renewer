// src/dtos/create-user.dto.ts
export interface CreateUserDto {
    email: string;
    password: string;
    nickname?: string;
    firstName: string;
    lastName: string;
    region: string;
    country: string;
    role?: string;
    status?: string;
    dealer?: string;
    jobPosition: string;
}
