import mongoose, { Model, Schema, Document, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import IUser from '../types/models/User';
import envHelper from '../utils/getEnv';

interface IUserMethods {
    getSignedJwtToken: () => string;
    matchPassword: (enteredPassword: string) => Promise<boolean>;
    getResetPasswordToken: () => string;
}

type UserModelType = Model<IUser, {}, IUserMethods>;

class UserModel {
    private userSchema;
    private static instance: UserModel;

    private constructor() {
        this.userSchema = this.getSchema();
        this.hookInit();
        this.methodInit();
    }

    private getSchema() {
        return new Schema<IUser, UserModelType, IUserMethods>({
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
    }

    private hookInit() {
        this.encryptPassword(); //Encrypt password using bcrypt
    }

    private methodInit() {
        this.getSignedJwtToken();
        this.matchPassword();
        this.getResetPasswordToken();
    }

    private encryptPassword(): void {
        this.userSchema.pre('save', async function (next) {
            if (!this.isModified('password')) {
                next();
            }
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        })
    }

    private getSignedJwtToken(): void {
        this.userSchema.methods.getSignedJwtToken = function () {
            return jwt.sign({ id: this._id }, envHelper.getEnv<string>("JWT_SECRET"), {
                expiresIn: envHelper.getEnv("JWT_EXPIRE")
            });
        }
    }

    private matchPassword(): void {
        this.userSchema.methods.matchPassword = async function (enteredPassword: string) {
            return await bcrypt.compare(enteredPassword, this.password)
        }
    }

    private getResetPasswordToken(): void {
        this.userSchema.methods.getResetPasswordToken = function () {
            const resetToken = crypto.randomBytes(32).toString('hex');
            this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
            return resetToken;
        }
    }

    public getModel() {
        return model<IUser, UserModelType>('User', this.userSchema);
    }

    public static getInstance(): UserModel {
        if (!this.instance) {
            this.instance = new UserModel();
        }
        return this.instance;
    }
}
const User = UserModel.getInstance().getModel();
export default User;