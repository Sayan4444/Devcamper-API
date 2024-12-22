import express, { Router } from 'express';
import { protect, authorize } from '../Middleware/auth';
import { getReviews, getReview, addReview, updateReview, deleteReview } from '../controller/review';
import Review from '../models/Reviews';
import advancedResults from '../Middleware/advancedResults';
import BaseRoutes from './BaseRoutes';

export default class ReviewRoutes extends BaseRoutes {
    constructor() {
        super();
    }
    protected initializeRoutes(): void {
        this.router
            .route('/')
            .get(advancedResults(Review, {
                path: 'bootcamp',
                select: 'name description'
            }), getReviews)
            .post(protect, authorize('user', 'admin'), addReview);

        this.router
            .route('/:id')
            .get(getReview)
            .put(protect, authorize('user', 'admin'), updateReview)
            .delete(protect, authorize('user', 'admin'), deleteReview);
    }
}