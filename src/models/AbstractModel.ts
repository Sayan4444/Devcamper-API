import { model, Model, Schema } from "mongoose";

// IUser,IUserModel,IUserMethods
export default abstract class AbstractModel<T, U, V> {
    protected schema: Schema<T, U, V>;
    protected model: U;

    constructor(modelName: string) {
        this.schema = this.getSchema();
        this
            .staticsInit()
            .hookInit()
            .methodInit();
        this.model = model<T, U>(modelName, this.schema);
    }

    protected abstract getSchema(): Schema<T, U, V>;
    protected staticsInit(): this { return this; };
    protected hookInit(): this { return this; };
    protected methodInit(): this { return this; };

    public getModel(): U {
        return this.model;
    }
}