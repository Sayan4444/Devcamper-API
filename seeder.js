const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors')
const dotenv = require('dotenv');

//Load env variables
dotenv.config({ path: './config/config.env' });

//Load models
const Bootcamp = require('./Model/Devcamper');

//Connect to DB
mongoose.set('strictQuery', false);
const DB = process.env.MONGO_URI;

mongoose.connect(DB)
    .then(() => console.log("connected to mongoDB server".green.bold))
    .catch((err) => console.log("not connected to mongo server".red.bold));


const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

//Import into DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        console.log('Data imported'.green.inverse);
        process.exit();
    } catch (error) {
        console.log(error);;
    }
}

//Delete from DB

const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        console.log('Data deleted'.red.inverse);
        process.exit();
    } catch (error) {
        console.log(error);;
    }
}

if (process.argv[2] === '-i') importData();
else if (process.argv[2] === '-d') deleteData();