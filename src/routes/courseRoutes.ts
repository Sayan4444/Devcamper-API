import coursesController from '../controller/courses';
import Course from '../models/Course';
import advancedResults from '../Middleware/advancedResults';
import BaseRoutes from './BaseRoutes';

export default class CourseRoutes extends BaseRoutes {
    private static obj: CourseRoutes;
    constructor() {
        super();
    }

    protected initializeRoutes(): void {
        const { authorize, protect } = this.authMiddleware;
        this.router
            .route('/')
            .post(protect, authorize(['publisher', 'admin']), coursesController.addCourse)
            .get(advancedResults(Course, {
                path: 'bootcamp',
                select: 'name description'
            }), coursesController.getCourses)

        this.router
            .route('/:id')
            .get(coursesController.getCourseById)
            .put(protect, authorize(['publisher', 'admin']), coursesController.updateCourse)
            .delete(protect, authorize(['publisher', 'admin']), coursesController.deleteCourse);
    }
    public static getInstance(): CourseRoutes {
        if (!this.obj) {
            this.obj = new CourseRoutes();
        }
        return this.obj;
    }
}
