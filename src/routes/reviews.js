const express = require('express');
const { protect, authorize } = require('../Middleware/auth')
const { getReviews, getReview, addReview, updateReview, deleteReview } = require('../controller/review');

const router = express.Router({ mergeParams: true });
const Review = require('../models/Reviews');
const advancedResults = require('../Middleware/advancedResults');

router
    .route('/')
    .get(advancedResults(Review, {
        path: 'bootcamp',
        select: 'name description'
    }), getReviews)
    .post(protect, authorize('user', 'admin'), addReview);

router
    .route('/:id')
    .get(getReview)
    .put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview)

module.exports = router;
