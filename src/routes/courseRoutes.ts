import { getCourses, getCourseById, addCourse, updateCourse, deleteCourse } from '../controller/courses';
import Course from '../models/Course';
import advancedResults from '../Middleware/advancedResults';
import BaseRoutes from './BaseRoutes';

export default class CourseRoutes extends BaseRoutes {
    constructor() {
        super();
    }

    protected initializeRoutes(): void {
        const { authorize, protect } = this.authMiddleware;
        this.router
            .route('/')
            .get(advancedResults(Course, {
                path: 'bootcamp',
                select: 'name description'
            }), getCourses)
            .post(protect, authorize(['publisher', 'admin']), addCourse);

        this.router
            .route('/:id')
            .get(getCourseById)
            .put(protect, authorize(['publisher', 'admin']), updateCourse)
            .delete(protect, authorize(['publisher', 'admin']), deleteCourse);
    }
}
