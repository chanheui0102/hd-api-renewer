// src/types/statistics-response.type.ts

export interface UsersStackResponse {
    createUser?: number;
    subscribeUser?: number;
    visitors?: number;
}

interface UsersCountWithDate {
    date: string;
    count: number;
}

export interface UsersCountResponse {
    subscribeUsers: UsersCountWithDate[];
    createUsers: UsersCountWithDate[];
    visitors: UsersCountWithDate[];
}

export interface WebzineTop {
    title: string;
    viewCount: number;
    recommendCount: number;
    commentCount: number;
}

export interface WebzineTopResponse {
    totalViewCount: number;
    totalRecommendCount: number;
    totalCommentCount: number;
    viewTop: WebzineTop[];
    recommendTop: WebzineTop[];
    commentTop: WebzineTop[];
}

export interface StatisticsArticles {
    totalViewCount: number;
    totalRecommendCount: number;
    totalCommentCount: number;
    articles: Array<{
        category: string;
        title: string;
        commentCount: number;
        viewCount: number;
        recommendCount: number;
    }>;
}

// etc. as needed
