import { Request, Response } from 'express';
import IUser from '../models/User';

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
