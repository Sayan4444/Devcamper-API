import express, { Router } from 'express';
import { protect, authorize } from '../Middleware/auth';
import { createBootcamps, deleteBootcamps, getBootcamps, updateBootcamps, getSingleBootcamp, getBootcampsInRadius, bootcampPhotoUpload } from '../controller/bootcamps';
import Bootcamp from '../models/Bootcamp';
import advancedResults from '../Middleware/advancedResults';
import ReviewRouter from './reviewRoutes';
import CourseRoutes from './courseRoutes';
import BaseRoutes from './BaseRoutes';

export default class BootcampRoutes extends BaseRoutes {
    constructor() {
        super();
    }
    protected initializeRoutes(): void {
        this.router.use('/:bootcampId/courses', new CourseRoutes().getRouter());
        this.router.use('/:bootcampId/reviews', new ReviewRouter().getRouter());

        this.router
            .route('/')
            .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
            .post(protect, authorize('publisher', 'admin'), createBootcamps);

        this.router
            .route('/:id')
            .get(getSingleBootcamp)
            .put(protect, authorize('publisher', 'admin'), updateBootcamps)
            .delete(protect, authorize('publisher', 'admin'), deleteBootcamps);

        this.router
            .route('/radius/:zipcode/:distance')
            .get(getBootcampsInRadius);

        this.router
            .route('/:id/photo')
            .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);
    }
}
