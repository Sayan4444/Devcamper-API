import bootcampController from '../controller/bootcamps';
import Bootcamp from '../models/Bootcamp';
import advancedResults from '../Middleware/advancedResults';
import ReviewRouter from './reviewRoutes';
import CourseRoutes from './courseRoutes';
import BaseRoutes from './BaseRoutes';

export default class BootcampRoutes extends BaseRoutes {
    private static obj: BootcampRoutes;
    constructor() {
        super();
    }
    protected initializeRoutes(): void {
        const { authorize, protect } = this.authMiddleware;

        this.router.use('/:bootcampId/courses', CourseRoutes.getInstance().getRouter());
        this.router.use('/:bootcampId/reviews', ReviewRouter.getInstance().getRouter());

        this.router
            .route('/')
            .get(advancedResults(Bootcamp, 'courses'), bootcampController.getBootcamps)
            .post(protect, authorize(['publisher', 'admin']), bootcampController.createBootcamps);

        this.router
            .route('/:id')
            .get(bootcampController.getSingleBootcamp)
            .put(protect, authorize(['publisher', 'admin']), bootcampController.updateBootcamps)
            .delete(protect, authorize(['publisher', 'admin']), bootcampController.deleteBootcamps);

        this.router
            .route('/radius/:zipcode/:distance')
            .get(bootcampController.getBootcampsInRadius);

        this.router
            .route('/:id/photo')
            .put(protect, authorize(['publisher', 'admin']), bootcampController.bootcampPhotoUpload);
    }

    public static getInstance(): BootcampRoutes {
        if (!this.obj) {
            this.obj = new BootcampRoutes();
        }
        return this.obj;
    }
}
