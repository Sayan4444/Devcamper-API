import ErrorResponse from '../utils/errorResponse';
import crypto from 'crypto';
import asyncHandler from '../Middleware/async';
import User, { IUserDocument } from '../models/User';
import sendEmail from '../utils/sendEmail';
import { Request, Response, NextFunction, CookieOptions } from 'express';
import envHelper from '../utils/getEnv';

// @desc   Register user
// @route  POST /api/v1/auth/register
// @access Public

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body;

    //Create user
    const user = await User.create({ name, email, password, role })
    sendTokenResponse(user, 200, res);
});

// @desc   Login user
// @route  POST /api/v1/auth/login
// @access Public

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    //Validate email and password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    //Check for user
    const user = await User.findOne({ email }).select('password')
    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    //Checking if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});

// @desc   Logout/clear cookie
// @route  POST /api/v1/auth/logout
// @access Private

export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie('token', { httpOnly: true, secure: false });
    res.status(200).json({
        success: true,
        data: {}
    })
})

// @desc   Get current logged in user
// @route  POST /api/v1/auth/login
// @access Private

export const getMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        data: req.user
    })
})


// @desc   Update user details(name,email)
// @route  PUT /api/v1/auth/updatedetails
// @access Private

export const updateDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
    }
    const user = await User.findByIdAndUpdate(req.user!.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        data: user
    })
})


// @desc   Update password
// @route  POST /api/v1/auth/updatepassword
// @access Private

export const updatePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user: IUserDocument = (await User.findById(req.user!.id).select('password'))!;

    //Check current password
    if (!await user.matchPassword(req.body.currentPassword)) {
        return next(new ErrorResponse('Password is incorrent', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
})

// @desc   Forgot password
// @route  POST /api/v1/auth/forgotpassword
// @access Public

export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Get user based on POSTED email
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }
    //Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetURl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    console.log({
        protocol: req.protocol,
        host: req.get('host')
    });
    const message = `You are receiving this email because you requested to reset the password. Please make a put request to \n\n ${resetURl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        })
        res.status(200).json({ success: true, data: 'Email send' });
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorResponse('Email could not be send', 500));
    }
})

// @desc   Reset password
// @route  POST /api/v1/auth/resetpassword/:resettoken
// @access Public

export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log('hit', req.params.resettoken);
    //Get hashed token
    const resetToken = req.params.resettoken;
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    //Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res)
})

//Get token from model,create cookie and send response
const sendTokenResponse = (user: IUserDocument, statusCode: number, res: Response) => {
    //Create token
    const token = user.getSignedJwtToken();

    const options: CookieOptions = {
        expires: new Date(Date.now() + envHelper.getEnv<number>("JWT_COOKIE_EXPIRE") * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }
    if (envHelper.getEnv("NODE_ENV") === 'Production') {
        options.secure = true;
    }
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })
}