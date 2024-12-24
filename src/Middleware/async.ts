import { Request, Response, NextFunction } from "express";

interface IAsyncHandler {
    (req: Request, res: Response, next: NextFunction): Promise<void>;
}

const asyncHandler = (fn: IAsyncHandler) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        fn(req, res, next).catch(err => next(err));
    };
};

export default asyncHandler;
