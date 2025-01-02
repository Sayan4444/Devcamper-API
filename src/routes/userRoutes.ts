import userController from '../controller/users';
import User from '../models/User';
import advancedResults from '../Middleware/advancedResults';
import BaseRoutes from './BaseRoutes';

export default class UserRoutes extends BaseRoutes {
    private static obj: UserRoutes;
    constructor() {
        super();
    }
    protected initializeRoutes(): void {
        const { authorize, protect } = this.authMiddleware;

        this.router.use(protect);
        this.router.use(authorize(['admin']));

        this.router
            .route('/')
            .get(advancedResults(User), userController.getUsers)
            .post(userController.createUser);

        this.router
            .route('/:id')
            .get(userController.getUser)
            .put(userController.updateUser)
            .delete(userController.deleteUser);
    }
    public static getInstance(): UserRoutes {
        if (!this.obj) {
            this.obj = new UserRoutes();
        }
        return this.obj;
    }
}
