// src/dtos/request-code.dto.ts
export type CodeType = 'subscribe' | 'unsubscribe';

export interface RequestCodeDto {
    email: string;
    type: CodeType;
}
