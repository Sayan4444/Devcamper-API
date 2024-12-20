const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../Middleware/auth')

const { createBootcamps, deleteBootcamps, getBootcamps, updateBootcamps, getSingleBootcamp, getBootcampsInRadius, bootcampPhotoUpload } = require('../controller/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../Middleware/advancedResults');
// @route:/api/v1/bootcamps

//Redirecting routes to another router
const CourseRouter = require('./courses');
const ReviewRouter = require('./reviews');

router.use('/:bootcampId/courses', CourseRouter);
router.use('/:bootcampId/reviews', ReviewRouter);

router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamps)

router
    .route('/:id')
    .get(getSingleBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamps)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamps)

router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius)

router
    .route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

module.exports = router;