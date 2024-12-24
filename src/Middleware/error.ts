import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/errorResponse';
import color from 'colors';

interface CustomError extends Error {
    code?: number;
    errors?: { [key: string]: { message: string } };
}

export default function errorHandler(err: ErrorResponse | CustomError, req: Request, res: Response, next: NextFunction) {
    console.log(color.red(err.message));

    if (err instanceof ErrorResponse) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
    }
    let error = new ErrorResponse("Server Error", 500);
    //Mongoose bad object ID
    if (err.name === 'CastError') {
        const message = `Resource not found`;
        error = new ErrorResponse(message, 404);
    }
    //Mongoose  duplicate key
    else if (err.code === 11000) {
        const message = `Duplicate field value entered`;
        err = new ErrorResponse(message, 400);
    }
    // // Mongoose validation error
    else if (err.name === 'ValidationError') {
        let messageAr: string[] = [];
        for (const key in err.errors) {
            const errorMessage = err.errors[key].message;
            if (errorMessage) {
                messageAr.push(errorMessage);
            }
        }
        const message = messageAr.join(",");
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode).json({
        success: false,
        error: err.message
    });
}

