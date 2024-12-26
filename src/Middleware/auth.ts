import ErrorResponse from "../utils/errorResponse";
import asyncHandler from "./async";
import User from '../models/User';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";

export default class AuthMiddleware {
    private isUserFound(user: IUser) {
        if (!user) {
            return new ErrorResponse('User not found', 404);
        }
    }
    // Protect routes middleware
    public protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        let token: string | undefined;
        // Extract token from headers or cookies
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies) {
            token = req.cookies.token;
        }

        // If no token is found, return an unauthorized error
        if (!token) {
            return next(new ErrorResponse('Not authorized to access this route', 401));
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        // Fetch the user and attach it to the request
        const user = await User.findById(decoded.id) as IUser;
        this.isUserFound(user);

        req.user = user; // Attach user to request
        next();
    });

    // Authorize specific roles middleware
    public authorize = (roles: string[]) => {
        return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
            const user = req.user;

            if (!user) {
                return next(new ErrorResponse('User not found', 404));
            }
            // Check if the user's role is authorized
            if (!roles.includes(user.role)) {
                return next(new ErrorResponse(`User role ${user.role} is unauthorized to access this route`, 403));
            }

            next();
        });
    };
}