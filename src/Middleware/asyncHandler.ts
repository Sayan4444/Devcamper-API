import { Request, Response, NextFunction } from "express";

// A=QueryParams(":"),
// B=ResponseBody,
// C=RequestBody,
// D=QueryParams("?"),
interface IAsyncHandler<A = any, B = any, C = any, D = any> {
    (req: Request<A, B, C, D>, res: Response, next: NextFunction): Promise<void>;
}

const asyncHandler = <A = any, B = any, C = any, D = any>(fn: IAsyncHandler<A, B, C, D>) => {
    return (req: Request<A, B, C, D>, res: Response, next: NextFunction): void => {
        fn(req, res, next).catch(err => next(err));
    };
};

export default asyncHandler;