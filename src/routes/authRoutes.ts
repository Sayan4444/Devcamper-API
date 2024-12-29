import authController from '../controller/auth';
import BaseRoutes from './BaseRoutes';

export default class AuthRoutes extends BaseRoutes {
    constructor() {
        super();
    }
    protected initializeRoutes(): void {
        const { protect } = this.authMiddleware;

        this.router.post('/register', authController.register);
        this.router.post('/login', authController.login);
        this.router.get('/logout', authController.logout);
        this.router.get('/me', protect, authController.getMe);
        this.router.put('/updatedetails', protect, authController.updateDetails);
        this.router.put('/updatepassword', protect, authController.updatePassword);
        this.router.post('/forgotpassword', authController.forgotPassword);
        this.router.put('/resetpassword/:resettoken', authController.resetPassword);
    }
}
