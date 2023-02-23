const express = require('express');
const router = express.Router();

const { createBootcamps, deleteBootcamps, getBootcamps, updateBootcamps, getSingleBootcamp } = require('../controller/bootcamps');

// @route:/api/v1/bootcamps

router
    .route('/')
    .get(getBootcamps)
    .post(createBootcamps)

router
    .route('/:id')
    .get(getSingleBootcamp)
    .put(updateBootcamps)
    .delete(deleteBootcamps)

module.exports = router;