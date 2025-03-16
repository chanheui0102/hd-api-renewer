// src/dtos/update-comment.dto.ts

export interface UpdateCommentDto {
    articleId: string;
    commentId: string;
    password?: string; // 비회원 수정 시 사용
    content?: string;
    nickname?: string;
}
