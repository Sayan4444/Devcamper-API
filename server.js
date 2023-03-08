const express = require('express');
const path = require('path')
const colors = require('colors')
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./Middleware/error');

const app = express();

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Load env variables
dotenv.config({ path: './config/config.env' });

//Connecting database
const connectDB = require('./config/db');
connectDB();

//Load route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');

//This console.log in method:status code: url
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//File Uploading
app.use(fileupload());

//Set static folder
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

//Mount route files
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
//Handling error controller function
app.use(errorHandler);

//Running server
const PORT = process.env.PORT;
const server = app.listen(PORT, () => console.log('Server running'.blue.bold));

//Handling unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit());
})