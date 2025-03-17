// src/types/ga-response.ts
export interface UserEngagementDuration {
    date: string; // e.g. "2023-05-15"
    userCount: number; // e.g. 10
    duration: number; // e.g. 10
    avarageDuration: number; // e.g. 10
}

export interface UsersDurationResponse {
    begin: string;
    end: string;
    rows: UserEngagementDuration[];
}

interface UserChannelData {
    newsletter: number;
    direct: number;
}

export interface UserChannelGroup {
    [date: string]: UserChannelData;
    // e.g. { "2023-05-20": { direct: 10, newsletter: 10 }, ... }
}
