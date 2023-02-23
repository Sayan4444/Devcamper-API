const Bootcamp = require('../Model/Devcamper');

exports.getBootcamps = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.find();
        res.status(200).json({
            success: true,
            count: bootcamp.length,
            body: bootcamp
        })
    } catch (error) {
        res.status(400).json({ success: false })
    }
}

exports.getSingleBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            throw new Error;
        }
        res.status(200).json({
            success: true,
            body: bootcamp
        })
    } catch (error) {
        res.status(400).json({ success: false })
    }
}

exports.createBootcamps = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
            success: true,
            body: bootcamp
        })
    } catch (error) {
        res.status(400).json({ success: false, error })
    }

}

exports.updateBootcamps = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!bootcamp) {
            throw new Error;
        }
        res.status(200).json({
            success: true,
            body: bootcamp
        })
    } catch (error) {
        res.status(400).json({ success: false })
    }
}

exports.deleteBootcamps = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
        if (!bootcamp) {
            throw new Error;
        }
        res.status(200).json({
            success: true,
        })

    } catch (error) {
        res.status(400).json({ success: false })
    }
}

