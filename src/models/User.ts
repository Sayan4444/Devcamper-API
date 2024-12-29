import mongoose, { Model, Schema, Document, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import IUser from '../types/models/User';
import envHelper from '../utils/getEnv';
import AbstractModel from './AbstractModel';

interface IUserMethods {
    getSignedJwtToken: () => string;
    matchPassword: (enteredPassword: string) => Promise<boolean>;
    getResetPasswordToken: () => string;
}

type UserModelType = Model<IUser, {}, IUserMethods>;

class UserModelBuilder extends AbstractModel<IUser, UserModelType, IUserMethods> {
    private static obj: UserModelBuilder;
    private constructor() {
        const modelName = 'User';
        super(modelName);
    }

    protected getSchema(): Schema<IUser, UserModelType, IUserMethods> {
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

    protected hookInit(): this {
        this.encryptPassword(); //Encrypt password using bcrypt
        return this;
    }

    protected methodInit(): this {
        this
            .getSignedJwtToken()
            .matchPassword()
            .getResetPasswordToken();

        return this;
    }

    private encryptPassword(): this {
        this.schema.pre('save', async function (next) {
            if (!this.isModified('password')) {
                next();
            }
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        })
        return this;
    }

    private getSignedJwtToken(): this {
        this.schema.methods.getSignedJwtToken = function () {
            return jwt.sign({ id: this._id }, envHelper.getEnv<string>("JWT_SECRET"), {
                expiresIn: envHelper.getEnv("JWT_EXPIRE")
            });
        }
        return this;
    }

    private matchPassword(): this {
        this.schema.methods.matchPassword = async function (enteredPassword: string) {
            return await bcrypt.compare(enteredPassword, this.password)
        }
        return this;
    }

    private getResetPasswordToken(): this {
        this.schema.methods.getResetPasswordToken = function () {
            const resetToken = crypto.randomBytes(32).toString('hex');
            this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
            return resetToken;
        }
        return this;
    }

    public static getInstance(): UserModelBuilder {
        if (!this.obj) {
            this.obj = new UserModelBuilder();
        }
        return this.obj;
    }
}
const User = UserModelBuilder.getInstance().getModel();
export default User;