const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
    // console.error("Error name".red, err.name);


    let error = { message: err.message, statusCode: err.statusCode }

    //Mongoose bad object ID
    if (err.name === 'CastError') {
        const message = `Resource not found`
        error = new ErrorResponse(message, 404);
    }

    //Mongoose  duplicate key
    if (err.code === 11000) {
        const message = `Duplicate field value entered`;
        error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        let message = [];
        for (const key in err.errors) {
            const errorMessage = err.errors[key].message;
            if (errorMessage) {
                message.push(errorMessage);
            }
        }
        message = message.join(",");
        error = new ErrorResponse(message, 400);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Server Error"
    })
}

module.exports = errorHandler;