import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../Middleware/asyncHandler';
import Review from '../models/Reviews';
import Bootcamp from '../models/Bootcamp';
import { Request, Response, NextFunction } from 'express';
import IReview from '../types/models/Review';
import { BootcampIdParams, IdParams } from '../types/controller';


class ReviewController {

    // @desc   Get reviews
    // @route  GET /api/v1/bootcamps/:bootcampId/reviews
    // @route  GET /api/v1/reviews
    public getReviews = asyncHandler(async (req: Request<BootcampIdParams>, res: Response, next: NextFunction) => {
        if (req.params.bootcampId) {
            const review = await Review.find({ bootcamp: req.params.bootcampId });
            res.status(200).json({
                success: true,
                count: review.length,
                data: review
            })
        } else {
            res.status(200).json(res.advancedResults);
        }
    })

    // @desc   Get single reviews
    // @route  GET /api/v1/reviews/:id
    public getReview = asyncHandler(async (req: Request<IdParams>, res: Response, next: NextFunction) => {
        const review = await Review.findById(req.params.id).populate({
            path: 'bootcamp',
            select: 'name description'
        })

        if (!review) {
            return next(new ErrorResponse(`No review with the id of ${req.params.id}`, 404))
        }

        res.status(200).json({
            success: true,
            data: review
        })
    })

    // @desc   Add review
    // @route  POST /api/v1/bootcamps/:bootcampId/reviews
    // @access public

    public addReview = asyncHandler(async (req: Request<BootcampIdParams, {}, IReview>, res: Response, next: NextFunction) => {
        req.body.bootcamp = req.params.bootcampId;
        req.body.user = req.user!.id;

        const bootcamp = await Bootcamp.findById(req.params.bootcampId);
        if (!bootcamp) {
            return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404))
        }

        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            data: review
        })
    })

    // @desc   Update review
    // @route  PUT /api/v1/reviews/:id
    public updateReview = asyncHandler(async (req: Request<IdParams, {}, IReview>, res: Response, next: NextFunction) => {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return next(new ErrorResponse(`No review with the id of ${req.params.id}`, 404))
        }

        //Make sure review belongs to a user signed or user is admin
        if (review.user.toString() !== req.user!.id && req.user!.role !== 'admin') {
            return next(new ErrorResponse('Not authorized to update review', 404))
        }

        const reviewUpdated = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        res.status(201).json({
            success: true,
            data: reviewUpdated
        })
    })

    // @desc   Delete review
    // @route  DELETE /api/v1/reviews/:id
    public deleteReview = asyncHandler(async (req: Request<IdParams>, res: Response, next: NextFunction) => {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return next(new ErrorResponse(`No review with the id of ${req.params.id}`, 404))
        }

        //Make sure review belongs to a user signed or user is admin
        if (review.user.toString() !== req.user!.id && req.user!.role !== 'admin') {
            return next(new ErrorResponse('Not authorized to update review', 404))
        }

        await review.remove();

        res.status(201).json({
            success: true,
            data: {}
        })
    })
}

const reviewController = new ReviewController();
export default ReviewController;

