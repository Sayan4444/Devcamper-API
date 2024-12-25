import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
        interface Response {
            advancedResults?: {
                success: boolean,
                count: number,
                pagination: {
                    next?: {
                        page: number,
                        limit: number
                    },
                    prev?: {
                        page: number,
                        limit: number
                    }
                },
            }
        }
    }
}
