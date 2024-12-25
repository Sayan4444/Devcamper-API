import { register, login, getMe, forgotPassword, resetPassword, updateDetails, updatePassword, logout } from '../controller/auth';
import BaseRoutes from './BaseRoutes';

export default class AuthRoutes extends BaseRoutes {
    constructor() {
        super();
    }
    protected initializeRoutes(): void {
        const { protect } = this.authMiddleware;

        this.router.post('/register', register);
        this.router.post('/login', login);
        this.router.get('/logout', logout);
        this.router.get('/me', protect, getMe);
        this.router.put('/updatedetails', protect, updateDetails);
        this.router.put('/updatepassword', protect, updatePassword);
        this.router.post('/forgotpassword', forgotPassword);
        this.router.put('/resetpassword/:resettoken', resetPassword);
    }
}
