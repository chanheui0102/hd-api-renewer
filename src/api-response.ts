// src/constants/api-response.ts
type APInResponseType =
    | 'FILE_UPLOAD_PROBLEM'
    | 'BLOCKED_USER'
    | 'SEND_MAIL_FAILED'
    | 'SEND_MAIL_SUCCESS'
    | 'SUCCESS'
    | 'FAILED'
    | 'CONFLICT'
    | 'NOT_FOUND_DATA';

export interface APIResponse {
    statusCode: number;
    message: string;
    data?: any;
}

type APIResponseTypes = {
    [key in APInResponseType]: APIResponse;
};

export const RESPONSE: APIResponseTypes = {
    BLOCKED_USER: {
        statusCode: 403,
        message: 'This user got failed login over 5',
    },
    SEND_MAIL_SUCCESS: {
        statusCode: 200,
        message: 'Mail has been sent successfully',
    },
    SEND_MAIL_FAILED: {
        statusCode: 400,
        message: 'Mail sending failed',
    },
    SUCCESS: {
        statusCode: 200,
        message: 'Request processed successfully',
    },
    FAILED: {
        statusCode: 400,
        message: 'Failed to process your request',
    },
    CONFLICT: {
        statusCode: 409,
        message: 'Conflict with the current state of the resource',
    },
    NOT_FOUND_DATA: {
        statusCode: 404,
        message: 'Not found data',
    },
    FILE_UPLOAD_PROBLEM: {
        statusCode: 400,
        message: 'File upload problem',
    },
};
