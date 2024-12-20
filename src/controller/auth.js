const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto')
const asyncHandler = require('../Middleware/async');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc   Register user
// @route  POST /api/v1/auth/register
// @access Public

exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    //Create user
    const user = await User.create({ name, email, password, role })

    sendTokenResponse(user, 200, res);
});

// @desc   Login user
// @route  POST /api/v1/auth/login
// @access Public

exports.login = asyncHandler(async (req, res, next) => {
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

exports.logout = asyncHandler(async (req, res, next) => {
    res.clearCookie('token', { httpOnly: true, secure: false });
    res.status(200).json({
        success: true,
        data: {}
    })
})

// @desc   Get current logged in user
// @route  POST /api/v1/auth/login
// @access Private

exports.getMe = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        data: req.user
    })
})


// @desc   Update user details(name,email)
// @route  PUT /api/v1/auth/updatedetails
// @access Private

exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
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

exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('password');

    //Check current password
    if (!await user.matchPassword(req.body.currentPassword)) {
        return next(new ErrorResponse('Password is incorrent'), 401);
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
})

// @desc   Forgot password
// @route  POST /api/v1/auth/forgotpassword
// @access Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
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
        return next(new ErrorResponse('Email could not be send'), 500);
    }
})

// @desc   Reset password
// @route  POST /api/v1/auth/resetpassword/:resettoken
// @access Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
    console.log('hit', req.params.resettoken);
    //Get hashed token
    const resetToken = req.params.resettoken;
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorResponse('Invalid token'), 400);
    }

    //Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res)
})

//Get token from model,create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }
    if (process.env.NODE_ENV === 'Production') {
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