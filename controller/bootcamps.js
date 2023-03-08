const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../Middleware/async');

// @desc   Get all bootcamps
// @route /api/v1/bootcamps
// @access Public

exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc   Get bootcamp by id
// @route /api/v1/bootcamps/id

exports.getSingleBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);
    //ID is in right format but not correct
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        body: bootcamp
    })

})

// @desc   Create new bootcamp
// @route /api/v1/bootcamps

exports.createBootcamps = asyncHandler(async (req, res, next) => {
    //Add user to req.body
    req.body.user = req.user.id;

    //Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id })
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with the id ${req.user.id} has already published a bootcamp`), 400);
    }
    const bootcamp = await Bootcamp.create(req.body);

    //If the user is not admin, they can only add one bootcamp


    res.status(201).json({
        success: true,
        body: bootcamp
    })
})

// @desc   Update bootcamp by id
// @route /api/v1/bootcamps/id

exports.updateBootcamps = asyncHandler(async (req, res, next) => {

    let bootcamp = await Bootcamp.findById(req.params.id);
    // ID is in right format but not correct
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404));
    }
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with the id of ${req.params.id} is not authorized to update`, 404));
    }
    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        body: bootcamp
    })
})

// @desc   Delete bootcamp by id
// @route /api/v1/bootcamps/id

exports.deleteBootcamps = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    // ID is in right format but not correct
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404));
    }
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with the id of ${req.params.id} is not authorized to delete`, 404));
    }
    bootcamp.remove();
    res.status(200).json({
        success: true,
        data: {}
    })
})
// @desc   Get bootcamps within a radius
// @route /api/v1/bootcamps/radius/zipcode/distance

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {

    const { zipcode, distance } = req.params;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${zipcode}&format=json&addressdetails=1`);
    const data = await response.json();
    const lat = data[0].lat;
    const lon = data[0].lon;

    // //Calculating radius using radians
    // //Divide distance by radius of Earth
    // //Earth Radius = 3,963 miles / 6,378 km

    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lon, lat], radius] } }
    })


    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
})

// @desc   Upload photo for bootcamp
// @route  PUT /api/v1/bootcamps/:id/photo
// @access Private

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    // ID is in right format but not correct
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404));
    }

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with the id of ${req.params.id} is not authorized to update`, 404));
    }

    if (!req.files) {
        return next(new ErrorResponse('Please upload a photo', 400));
    }
    const file = req.files.file;

    //Making sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload a file that is image', 400));
    }

    //Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    //Creatting custom file name BY name+id of bootcamp
    [nameFile, extension] = file.name.split('.');
    file.name = `${nameFile}_${req.params.id}.${extension}`;

    //Moving file to specific location in server
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
        if (err) {
            console.log(err);
            return next(new ErrorResponse('Problem with file upload', 500));
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name }, {
            new: true,
            runValidators: true
        })
    })
    res.status(200).json({
        success: true,
        data: file.name
    })
});