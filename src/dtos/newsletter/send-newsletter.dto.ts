// src/dtos/send-newsletter.dto.ts
export interface SendNewsletterDto {
    id: string; // MongoId
}

export interface SendTestNewsLetterDto extends SendNewsletterDto {
    email: string; // e.g. "abc@def.com"
}
