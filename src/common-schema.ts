// src/interfaces/common-schema.ts
export interface CommonSchema {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Page {
    beginPage: number;
    endPage: number;
}
