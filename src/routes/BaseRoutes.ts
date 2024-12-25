import { Router } from 'express';
import AuthMiddleware from '../Middleware/auth';

export default abstract class BaseRoutes {
    protected router: Router;
    protected authMiddleware: AuthMiddleware

    constructor() {
        this.router = Router({ mergeParams: true });
        this.authMiddleware = new AuthMiddleware();
        this.initializeRoutes();
    }

    protected abstract initializeRoutes(): void;

    public getRouter(): Router {
        return this.router;
    }
}