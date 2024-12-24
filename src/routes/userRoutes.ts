import { createUser, getUser, getUsers, updateUser, deleteUser } from '../controller/users';
import User from '../models/User';
import advancedResults from '../Middleware/advancedResults';
import AuthMiddleware from '../Middleware/auth';
import BaseRoutes from './BaseRoutes';

export default class UserRoutes extends BaseRoutes {
    private authMiddleware: AuthMiddleware;
    constructor() {
        super();
        this.authMiddleware = new AuthMiddleware();
    }
    protected initializeRoutes(): void {
        this.router.use(this.authMiddleware.protect);
        this.router.use(this.authMiddleware.authorize(['admin']));

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
