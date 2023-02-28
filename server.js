const express = require('express');
const colors = require('colors')
const dotenv = require('dotenv');
const morgan = require('morgan');
const errorHandler = require('./Middleware/error');

const app = express();
//Body parser
app.use(express.json());

//Load env variables
dotenv.config({ path: './config/config.env' });

//Connecting database
const { connectDB } = require('./config/db');
connectDB();

//Load route files
const bootcamps = require('./routes/bootcamps');

//This console.log in method:status code: url
// if (process.env.NODE_ENV === 'development') {
//     app.use(morgan('dev'));
// }

//Mount route files
app.use('/api/v1/bootcamps', bootcamps);
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