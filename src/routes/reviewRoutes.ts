import reviewController from '../controller/review';
import Review from '../models/Reviews';
import advancedResults from '../Middleware/advancedResults';
import BaseRoutes from './BaseRoutes';

export default class ReviewRoutes extends BaseRoutes {
    private static obj: ReviewRoutes;
    constructor() {
        super();
    }
    protected initializeRoutes(): void {
        const { authorize, protect } = this.authMiddleware;

        this.router
            .route('/')
            .get(advancedResults(Review, {
                path: 'bootcamp',
                select: 'name description'
            }), reviewController.getReviews)
            .post(protect, authorize(['user', 'admin']), reviewController.addReview);

        this.router
            .route('/:id')
            .get(reviewController.getReview)
            .put(protect, authorize(['user', 'admin']), reviewController.updateReview)
            .delete(protect, authorize(['user', 'admin']), reviewController.deleteReview);
    }
    public static getInstance(): ReviewRoutes {
        if (!this.obj) {
            this.obj = new ReviewRoutes();
        }
        return this.obj;
    }
}