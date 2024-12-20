const express = require('express');
const { protect, authorize } = require('../Middleware/auth')
const { getCourses, getCourseById, addCourse, updateCourse, deleteCourse } = require('../controller/courses');

const router = express.Router({ mergeParams: true });
const Course = require('../models/Course');
const advancedResults = require('../Middleware/advancedResults');
router
    .route('/')
    .get(advancedResults(Course, {
        path: 'bootcamp',
        select: 'name description'
    }), getCourses)
    .post(protect, authorize('publisher', 'admin'), addCourse)

router
    .route('/:id')
    .get(getCourseById)
    .put(protect, authorize('publisher', 'admin'), updateCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteCourse)

module.exports = router;
