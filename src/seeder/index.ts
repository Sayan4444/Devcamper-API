import fs from 'fs';
import dotenv from 'dotenv';

// Load models
import Bootcamp from '../models/Bootcamp';
import Course from '../models/Course';
import User from '../models/User';
import Review from '../models/Reviews';
import Database from '../db/connect';
import path from 'path';


class Seeder {
    private bootcamps!: any[];
    private courses!: any[];
    private users!: any[];
    private reviews!: any[];

    private db: Database;

    constructor() {
        this.loadEnvVariables();
        this.loadDummyData();
        this.db = new Database(process.env.MONGO_URI as string);
    }

    private loadEnvVariables(): void {
        dotenv.config({ path: path.resolve(__dirname, "../../.env") });
    }

    private loadDummyData(): void {
        this.bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
        this.courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
        this.users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
        this.reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));
    }

    private async importData(): Promise<void> {
        try {
            await Bootcamp.create(this.bootcamps);
            await Course.create(this.courses); //TODO: Error on db close
            await User.create(this.users);
            await Review.create(this.reviews); //TODO: Error on db close
            console.log('Data Imported...'.green.inverse);
        } catch (err) {
            console.error(err);
        }
    }

    private async deleteData(): Promise<void> {
        try {
            await Bootcamp.deleteMany();
            await Course.deleteMany();
            await User.deleteMany();
            await Review.deleteMany();
            console.log('Data Destroyed...'.red.inverse);
        } catch (err) {
            console.error(err);
        }
    }

    public async run(): Promise<void> {
        await this.db.connect();

        if (process.argv[2] === '-i') {
            await this.importData();
        } else if (process.argv[2] === '-d') {
            await this.deleteData();
        } else {
            console.log('Invalid command. Use -i to import data or -d to delete data.'.yellow.inverse);
        }

        await this.db.disconnect();
    }
}

(async () => {
    const seeder = new Seeder();
    await seeder.run();
})();