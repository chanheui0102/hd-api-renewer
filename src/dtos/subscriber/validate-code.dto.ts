// src/dtos/validate-code.dto.ts
import { RequestCodeDto } from './request-code.dto';

export interface ValidateCodeDto extends RequestCodeDto {
    code: string; // 6자리
}
