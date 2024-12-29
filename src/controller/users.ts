import asyncHandler from '../Middleware/asyncHandler';
import User from '../models/User';
import { Request, Response, NextFunction } from 'express';

class UserController {

    // @desc   Get all users
    // @route  POST /api/v1/auth/users
    public getUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        res.status(200).json(res.advancedResults);
    });

    // @desc   Get single user
    // @route  POST /api/v1/auth/users/:id
    public getUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const user = await User.findById(req.params.id);
        res.status(200).json({
            success: true,
            data: user
        });
    });

    // @desc   Create user
    // @route  POST /api/v1/auth/users
    public createUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const user = await User.create(req.body);
        res.status(201).json({
            success: true,
            data: user
        });
    });


    // @desc   Update user
    // @route  PUT /api/v1/auth/users/:id
    public updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: user
        });
    });


    // @desc   Delete user
    // @route  DELETE /api/v1/auth/users/:id
    public deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            data: {}
        });
    });
}

const userController = new UserController();
export default userController;


