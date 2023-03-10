const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors')
const dotenv = require('dotenv');

//Load env variables
dotenv.config({ path: './config/config.env' });

//Load models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Reviews = require('./models/Reviews');

//Connect to DB

const connectDB = require('./config/db');
connectDB();

// Read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

//Import into DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users)
        await Reviews.create(reviews)
        console.log('Data imported'.green.inverse);

    } catch (error) {
        console.log(error);;
    }
    process.exit();
}

//Delete from DB

const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Reviews.deleteMany();
        console.log('Data deleted'.red.inverse);

    } catch (error) {
        console.log(error);
    }
    process.exit();
}

const resetDB = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Reviews.deleteMany();
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users)
        await Reviews.create(reviews)
        console.log("DB reset".green.inverse);
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

if (process.argv[2] === '-i') importData();
else if (process.argv[2] === '-d') deleteData();
else if (process.argv[2] === '-a') resetDB();
