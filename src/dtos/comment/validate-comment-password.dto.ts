// src/dtos/validate-comment-password.dto.ts

export interface ValidateCommentPasswordDto {
    articleId: string;
    commentId: string;
    password: string;
}
