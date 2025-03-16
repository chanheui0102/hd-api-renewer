// src/dtos/delete-comment.dto.ts

export interface DeleteCommentDto {
    articleId: string;
    commentId: string;
    password: string; // 비회원이 삭제 시 필요
}
