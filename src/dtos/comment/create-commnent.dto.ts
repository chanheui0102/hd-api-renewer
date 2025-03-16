// src/dtos/create-comment.dto.ts

export interface CreateCommentDto {
    articleId: string; // MongoId
    content: string;
    nickname: string;
    password: string; // 비회원용 비밀번호
}
