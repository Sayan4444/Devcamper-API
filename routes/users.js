const express = require('express');
const { createUser, getUser, getUsers, updateUser, deleteUser } = require('../controller/users');

const router = express.Router({ mergeParams: true });
const User = require('../models/User');
const advancedResults = require('../Middleware/advancedResults');
const { authorize, protect } = require('../Middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router
    .route('/')
    .get(advancedResults(User), getUsers)
    .post(createUser)

router
    .route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser)

module.exports = router;
