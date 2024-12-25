import asyncHandler from '../Middleware/async';
import User from '../models/User';
import { Request, Response, NextFunction } from 'express';

export const getUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json(res.advancedResults);
});

export const getUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);
    res.status(200).json({
        success: true,
        data: user
    });
});

export const createUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.create(req.body);
    res.status(201).json({
        success: true,
        data: user
    });
});

export const updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        data: user
    });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success: true,
        data: {}
    });
});

