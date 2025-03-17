// src/dtos/find-vod.query.ts

export interface FindVodQuery {
    // from CalendarDto + FindPaginationDto
    begin: Date;
    end: Date;
    page: number;
    limit: number;

    search?: string;
    category?: string;
    region?: string;
    iso2?: string;
    response?: string; // 'Done' | 'Processing'
    status?: string; // 'Pass' | 'Hidden' | 'Pending'
    sort?: 'asc' | 'desc';
}

// findVodByOwner
export interface FindVodByOwnerQuery {
    page: number;
    limit: number;
    sort?: 'asc' | 'desc';
    response?: 'Done' | 'Processing';
}

// findVodByHq
export interface FindVodByHqQuery extends Omit<FindVodQuery, 'status'> {}
