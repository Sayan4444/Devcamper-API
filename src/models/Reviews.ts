import mongoose, { Model, Schema } from 'mongoose';
import IReview from '../types/models/Review';
import Bootcamp from './Bootcamp';

interface IReviewModel extends Model<IReview> {
    getAverageRating(bootcampId: string): Promise<void>;
}

class ReviewModel {
    private reviewSchema;
    private static instance: ReviewModel;

    private constructor() {
        this.reviewSchema = this.getSchema();
        this.addIndexing();
        this.staticsInit();
        this.hookInit();
    }

    private getSchema() {
        return new Schema<IReview, IReviewModel>({
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
                type: mongoose.Types.ObjectId,
                ref: 'Bootcamp',
                required: true
            },
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User',
                required: true
            },
        });
    }
    //Prevent user from submitting more than one review per bootcamp
    private addIndexing() {
        this.reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });
    }

    private staticsInit() {
        this.reviewSchema.statics.getAverageRating = async function (bootcampId: string) {
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
                await Bootcamp.findByIdAndUpdate(bootcampId, {
                    averageRating: Math.ceil(obj[0].averageRating)
                }, {
                    new: true,
                    runValidators: true
                });
            } catch (error) {
                console.log(error);
            }
        }
    }

    private hookInit() {
        this.reviewSchema.post('save', async function () {
            await Review.getAverageRating(this.bootcamp);
        })

        this.reviewSchema.pre('remove', { document: true, query: false }, async function () {
            await Review.getAverageRating(this.bootcamp);
        })
    }

    public getModel() {
        return mongoose.model<IReview, IReviewModel>('Review', this.reviewSchema);
    }

    public static getInstance(): ReviewModel {
        if (!this.instance) {
            this.instance = new ReviewModel();
        }
        return this.instance;
    }
}

const Review = ReviewModel.getInstance().getModel();
export default Review;