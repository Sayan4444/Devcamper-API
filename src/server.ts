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

import bootcamps from './routes/bootcamps';
import courses from './routes/courses';
import auth from './routes/auth';
import users from './routes/users';
import reviews from './routes/reviews';

import connectDB from './db/connect';
import mongoose from 'mongoose';
import { Server, IncomingMessage, ServerResponse } from 'http';

// const app = express();

// //Body parser
// app.use(express.json());

// //Cookie parser
// app.use(cookieParser());

// //Sanitize data
// app.use(mongoSanitize());

// //Set security headers
// app.use(helmet());

// //Prevent xss attacks(cross-site-scripting)
// app.use(xss());

// //Enable cors
// app.use(cors());

// // Apply the rate limiting middleware to all requests
// const limiter = rateLimit({
//     windowMs: 10 * 60 * 1000, // 10 minutes
//     max: 100, // Limit each IP to 100 requests per `window` (here, per 10 minutes)
// })
// app.use(limiter)

// //Prevent http param pollution
// app.use(hpp());

// //Load env variables
// // config({ path: '../.env' });
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

// //Connecting database
// // connectDB();
// mongoose.connect(process.env.MONGO_URI as string)
//     .then(() => console.log("connected to mongoDB server".green.bold))
//     .catch((err) => console.log("not connected to mongo server".red.bold));


// //This console.log in method:status code: url
// if (process.env.NODE_ENV === 'development') {
//     app.use(morgan('dev'));
// }

// //File Uploading
// app.use(fileupload());

// //Set static folder
// // app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static('public'));

// //Mount route files
// app.use('/api/v1/bootcamps', bootcamps);
// app.use('/api/v1/courses', courses);
// app.use('/api/v1/auth', auth);
// app.use('/api/v1/users', users);
// app.use('/api/v1/reviews', reviews);
// //Handling error controller function
// app.use(errorHandler);
// console.log(process.env.NODE_ENV);

// //Running server
// const PORT = process.env.PORT;
// const server = app.listen(PORT, () => console.log('Server running'.blue.bold));

// //Handling unhandled promise rejections
// process.on('unhandledRejection', (err, promise) => {
//     if (err instanceof Error) {
//         console.log(`Error: ${err.message}`);
//     } else {
//         console.log(`Error: ${err}`);
//     }
//     server.close(() => process.exit(1));
// })

export default class ApiServer {
    private app: express.Application;
    private port: string | number;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 5000;

        this.loadEnvVariables();
        this.connectDatabase();
        this.initializeMiddlewares();
        this.mountRoutes();
        this.initializeErrorHandling();
    }

    private loadEnvVariables(): void {
        dotenv.config({ path: path.resolve(__dirname, '../.env') });
    }

    private connectDatabase(): void {
        mongoose.connect(process.env.MONGO_URI as string)
            .then(() => console.log("connected to mongoDB server".green.bold))
            .catch((err) => console.log("not connected to mongo server".red.bold));
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

        if (process.env.NODE_ENV === 'development') {
            this.app.use(morgan('dev'));
        }

        this.app.use(fileupload()); //File Uploading
        this.app.use(express.static('public')); //Set static folder
    }

    private mountRoutes(): void {
        this.app.use('/api/v1/bootcamps', bootcamps);
        this.app.use('/api/v1/courses', courses);
        this.app.use('/api/v1/auth', auth);
        this.app.use('/api/v1/users', users);
        this.app.use('/api/v1/reviews', reviews);
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
    public startServer(): void {
        const server = this.app.listen(this.port, () => console.log(`Server running on port ${this.port}`.blue.bold));

        this.unhandledRejectionEvenetHandler(server); //Handling unhandled promise rejections

    }
}