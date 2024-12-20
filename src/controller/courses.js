const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../Middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc   Get all courses || Get all courses under a specific bootcamp
// @route  GET /api/v1/bootcamps/:bootcampId/courses

exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advancedResults);
    }
})

// @desc   Get course by id
// @route /api/v1/bootcamps/:id/courses

exports.getCourseById = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });
    if (!course) {
        return next(new ErrorResponse(`No course by the id ${req.params.id}`), 404);
    }

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc   Add course
// @route  POST /api/v1/bootcamps/:bootcampId/courses
// @access Private

exports.addCourse = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp by the id ${req.params.bootcampId}`), 404);
    }
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`, 401));
    }

    const course = await Course.create(req.body)
    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc   Update course
// @route  PUT /api/v1/courses/:id
// @access Private

exports.updateCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!course) {
        return next(new ErrorResponse(`No course by the id ${req.params.id}`), 404);
    }
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`, 401));
    }
    res.status(200).json({
        success: true,
        data: course
    })
})
// @desc   Delete course
// @route  DELETE /api/v1/courses/:id
// @access Private

exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        return next(new ErrorResponse(`No course by the id ${req.params.id}`), 404);
    }
    await course.remove();
    res.status(200).json({
        success: true,
        data: {}
    })
})
