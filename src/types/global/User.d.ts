declare global {
    interface IUser {
        name: string;
        email: string;
        role: 'user' | 'publisher';
        password: string;
        resetPasswordToken?: string;
        resetPasswordExpire?: Date;
        createdAt: Date;
    }
}

export { }; 