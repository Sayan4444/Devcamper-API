import mongoose from 'mongoose';

export default class Database {
    private uri: string;

    constructor(uri: string) {
        this.uri = uri;
        mongoose.set('strictQuery', false);
    }

    public async connect(): Promise<void> {
        try {
            await mongoose.connect(this.uri);
            console.log("connected to mongoDB server".green.bold);
        } catch (err) {
            console.log((err as Error).message);
            console.log("not connected to mongo server".red.bold);
            process.exit(1);
        }
    }

    public async disconnect(): Promise<void> {
        try {
            if (mongoose.connection.readyState === 0) {
                console.log("No active MongoDB connection to disconnect".yellow.bold);
                return;
            }
            await mongoose.disconnect();
            console.log("Disconnected from MongoDB server".yellow.bold);
        } catch (err) {
            console.log((err as Error).message);
            console.log("Error disconnecting from MongoDB server".red.bold);
        }
    }

}
