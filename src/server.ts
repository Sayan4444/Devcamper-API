import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import morgan from 'morgan';
import fileupload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cors from 'cors';
import errorHandler from './Middleware/error';

import type { Server, IncomingMessage, ServerResponse } from 'http';
import Database from './db/connect';

import { AuthRoutes, BootcampRoutes, CourseRoutes, ReviewRoutes, UserRoutes } from './routes';
import envHelper from './utils/getEnv';

export default class ApiServer {
    private app: express.Application;
    private port: string | number;
    private db: Database;

    constructor() {
        this.app = express();
        this.port = envHelper.getEnv<number>('PORT');

        this.loadEnvVariables();
        this.initializeMiddlewares();
        this.mountRoutes();

        this.db = new Database(envHelper.getEnv('MONGO_URI'));

        this.initializeErrorHandling();
    }
    private loadEnvVariables(): void {
        dotenv.config({ path: path.resolve(__dirname, '../.env') });
    }

    private initializeMiddlewares(): void {
        this.app.use(express.json()); //Body parser
        this.app.use(cookieParser()); //Cookie parser
        this.app.use(mongoSanitize()); //Sanitize data
        this.app.use(helmet()); //Set security headers
        this.app.use(xss()); //Prevent xss attacks(cross-site-scripting)
        this.app.use(cors()); //Enable cors

        const limiter = rateLimit({
            windowMs: 10 * 60 * 1000, // 10 minutes
            max: 100, // Limit each IP to 100 requests per `window` (here, per 10 minutes)
        });
        this.app.use(limiter); // Apply the rate limiting middleware to all requests
        this.app.use(hpp()); //Prevent http param pollution

        if (envHelper.getEnv("NODE_ENV") === 'development') {
            this.app.use(morgan('dev'));
        }

        this.app.use(fileupload()); //File Uploading
        this.app.use(express.static('public')); //Set static folder
    }

    private mountRoutes(): void {
        this.app.use('/api/v1/bootcamps', BootcampRoutes.getInstance().getRouter());
        this.app.use('/api/v1/courses', CourseRoutes.getInstance().getRouter());
        this.app.use('/api/v1/auth', AuthRoutes.getInstance().getRouter());
        this.app.use('/api/v1/users', UserRoutes.getInstance().getRouter());
        this.app.use('/api/v1/reviews', ReviewRoutes.getInstance().getRouter());
    }

    private initializeErrorHandling(): void {
        this.app.use(errorHandler);
    }

    private unhandledRejectionEvenetHandler(server: Server<typeof IncomingMessage, typeof ServerResponse>): void {
        process.on('unhandledRejection', (err) => {
            if (err instanceof Error) {
                console.log(`Error: ${err.message}`);
            } else {
                console.log(`Error: ${err}`);
            }
            server.close(() => process.exit(1));
        });
    }

    private async closeDBConnectionEventHandlers(): Promise<void> {
        // Handle nodemon restarts
        process.once('SIGUSR2', async () => {
            await this.db.disconnect();
            process.kill(process.pid, 'SIGUSR2');
        });

        // Handle app termination
        process.on('SIGINT', async () => {
            await this.db.disconnect();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await this.db.disconnect();
            process.exit(0);
        });
    }

    public async startServer(): Promise<void> {
        await this.db.connect();
        const server = this.app.listen(this.port, () => console.log(`Server running on port ${this.port}`.blue.bold));

        this.unhandledRejectionEvenetHandler(server); //Handling unhandled promise rejections
        await this.closeDBConnectionEventHandlers(); //Handling close db connection event handlers

    }
}