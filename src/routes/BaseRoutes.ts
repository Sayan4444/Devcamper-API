import { Router } from 'express';

export default abstract class BaseRoutes {
    protected router: Router;

    constructor() {
        this.router = Router({ mergeParams: true });
        this.initializeRoutes();
    }

    protected abstract initializeRoutes(): void;

    public getRouter(): Router {
        return this.router;
    }
}