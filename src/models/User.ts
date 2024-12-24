// import mongoose, { Model, Schema } from 'mongoose';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import crypto from 'crypto';
// import IUser from '../types/User';

// export interface IUserDocument extends IUser, Document {
//     getSignedJwtToken: () => string;
//     matchPassword: (enteredPassword: string) => Promise<boolean>;
//     getResetPasswordToken: () => string;
// }

// const UserSchema: Schema<IUserDocument> = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Please add a name']
//     },
//     email: {
//         type: String,
//         required: [true, 'Please add an email'],
//         unique: true,
//         match: [
//             /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
//             'Please add a valid email'
//         ]
//     },
//     role: {
//         type: String,
//         enum: ['user', 'publisher'],
//         default: 'user'
//     },
//     password: {
//         type: String,
//         required: [true, 'Please add a password'],
//         minlength: 6,
//         select: false
//     },
//     resetPasswordToken: String,
//     resetPasswordExpire: Date,
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// //Encrypt password using bcrypt
// UserSchema.pre<IUserDocument>('save', async function (next) {
//     // if (!this.isModified('password')) {
//     //     next();
//     // }
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// })

// //Returning jwt token against the USER document ID
// UserSchema.methods.getSignedJwtToken = function (): string {
//     return jwt.sign({ id: this._id }, process.env.JWT_SECRET as string, {
//         expiresIn: process.env.JWT_EXPIRE as string
//     });
// }

// //Match user entered password to hashed password in database
// UserSchema.methods.matchPassword = async function (this: IUserDocument, enteredPassword: string): Promise<boolean> {
//     return await bcrypt.compare(enteredPassword, this.password)
// }

// //Generate and hash token
// UserSchema.methods.getResetPasswordToken = function (): string {
//     // Generate token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//     this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
//     return resetToken;
// }

// const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', UserSchema);
// export default User;


import mongoose, { Model, Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import IUser from '../types/User';

export interface IUserDocument extends IUser, Document {
    getSignedJwtToken: () => string;
    matchPassword: (enteredPassword: string) => Promise<boolean>;
    getResetPasswordToken: () => string;
}

class UserModel {
    private userSchema: Schema<IUserDocument>;
    private static instance: UserModel;

    constructor() {
        this.userSchema = new mongoose.Schema({
            name: {
                type: String,
                required: [true, 'Please add a name']
            },
            email: {
                type: String,
                required: [true, 'Please add an email'],
                unique: true,
                match: [
                    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    'Please add a valid email'
                ]
            },
            role: {
                type: String,
                enum: ['user', 'publisher'],
                default: 'user'
            },
            password: {
                type: String,
                required: [true, 'Please add a password'],
                minlength: 6,
                select: false
            },
            resetPasswordToken: String,
            resetPasswordExpire: Date,
            createdAt: {
                type: Date,
                default: Date.now
            }
        });

        this.userSchema.pre<IUserDocument>('save', this.encryptPassword);
        this.userSchema.methods.getSignedJwtToken = this.getSignedJwtToken;
        this.userSchema.methods.matchPassword = this.matchPassword;
        this.userSchema.methods.getResetPasswordToken = this.getResetPasswordToken;
    }

    private async encryptPassword(this: IUserDocument, next: Function) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }

    private getSignedJwtToken(this: IUserDocument,): string {
        return jwt.sign({ id: this._id }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRE as string
        });
    }

    private async matchPassword(this: IUserDocument, enteredPassword: string): Promise<boolean> {
        return await bcrypt.compare(enteredPassword, this.password);
    }

    private getResetPasswordToken(this: IUserDocument,): string {
        const resetToken = crypto.randomBytes(32).toString('hex');
        this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
        return resetToken;
    }

    public getModel(): Model<IUserDocument> {
        return mongoose.model<IUserDocument>('User', this.userSchema);
    }

    public static getInstance(): UserModel {
        if (this.instance === null) {
            this.instance = new UserModel();
        }
        return this.instance;
    }
}

const user = UserModel.getInstance().getModel();
export default user;