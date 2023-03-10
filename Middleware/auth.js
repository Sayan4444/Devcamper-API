const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("./async");
const User = require('../models/User')
const jwt = require('jsonwebtoken');

//Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1];
    else if (req.cookies)
        token = req.cookies.token;
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route 1'), 401);
    }
    // TODO:delete the route 1
    try {
        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route 2'), 401);
    }
})

//Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is unauthorized to access this route`), 403);
        }
        next();
    }
}