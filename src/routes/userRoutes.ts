import { createUser, getUser, getUsers, updateUser, deleteUser } from '../controller/users';
import User from '../models/User';
import advancedResults from '../Middleware/advancedResults';
import { authorize, protect } from '../Middleware/auth';
import BaseRoutes from './BaseRoutes';

export default class UserRoutes extends BaseRoutes {
    constructor() {
        super();
    }
    protected initializeRoutes(): void {
        this.router.use(protect);
        // this.router.use(authorize('admin'));

        this.router
            .route('/')
            .get(advancedResults(User), getUsers)
            .post(createUser);

        this.router
            .route('/:id')
            .get(getUser)
            .put(updateUser)
            .delete(deleteUser);
    }
}
