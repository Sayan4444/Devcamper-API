import { Model, Schema } from "mongoose";

// IUser,IUserModel,IUserMethods
export default abstract class AbstractModel<T, U, V> {
    protected schema: Schema<T, U, V>;
    protected model: U;

    constructor() {
        this.schema = this.getSchema();
        this.staticsInit().hookInit().methodInit();
        this.model = this.createModel();
    }

    protected abstract getSchema(): Schema<T, U, V>;
    protected abstract staticsInit(): this;
    protected abstract hookInit(): this;
    protected abstract methodInit(): this;

    protected abstract createModel(): U;
    public getModel(): U {
        return this.model;
    }
}