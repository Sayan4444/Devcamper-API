const Bootcamp = require('../Model/Devcamper');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../Middleware/async');

exports.getBootcamps = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.find();
    res.status(200).json({
        success: true,
        count: bootcamp.length,
        body: bootcamp
    })
});

exports.getSingleBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);
    //ID is in right format but not correct
    if (!bootcamp) {
        next(new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404));
        return;
    }
    res.status(200).json({
        success: true,
        body: bootcamp
    })

})

exports.createBootcamps = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        success: true,
        body: bootcamp
    })
})

exports.updateBootcamps = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    // ID is in right format but not correct
    if (!bootcamp) {
        next(new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404));
        return;
    }
    res.status(200).json({
        success: true,
        body: bootcamp
    })
})

exports.deleteBootcamps = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    // ID is in right format but not correct
    if (!bootcamp) {
        next(new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404));
        return;
    }
    res.status(200).json({
        success: true,
    })
}
)
