// src/types/common-types.ts

export interface UpdateOneResponseType {
    acknowledged: boolean;
    modifiedCount: number;
    upsertedId: string | null;
    upsertedCount: number;
    matchedCount: number;
}

export interface ViewRecommendCommentType {
    viewCount: number;
    recommendCount: number;
    commentCount: number;
    recommended: boolean;
}

export interface PaginateType {
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
}

export interface MongooseDeleteResult {
    acknowledged: boolean;
    deletedCount: number;
}
