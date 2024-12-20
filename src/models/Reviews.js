const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for the review'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add a some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add rating between 1 and 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
});

//Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

ReviewSchema.statics.getAverageRating = async function (bootcampId) {
    try {
        const obj = await this.aggregate([
            {
                $match: { bootcamp: bootcampId },
            },
            {
                $group: {
                    _id: '$bootcamp',
                    averageRating: { $avg: '$rating' }
                }
            }
        ])
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: Math.ceil(obj[0].averageRating)
        }, {
            new: true,
            runValidators: true
        });
    } catch (error) {
        console.log(error);
    }
}

// Call get average cost after save
ReviewSchema.post('save', async function () {
    this.constructor.getAverageRating(this.bootcamp);
})

// Call get average cost before remove
ReviewSchema.pre('remove', async function () {
    this.constructor.getAverageRating(this.bootcamp);
})

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;

