export default interface IUser {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'publisher' | 'admin';
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    createdAt: Date;
}
