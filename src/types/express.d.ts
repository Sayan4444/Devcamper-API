import { Request, Response } from 'express';
import IUser from './User';

declare module 'express-serve-static-core' {
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