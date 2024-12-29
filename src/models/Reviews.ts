import mongoose, { model, Model, Schema } from 'mongoose';
import IReview from '../types/models/Review';
import Bootcamp from './Bootcamp';
import AbstractModel from './AbstractModel';

interface IReviewModel extends Model<IReview> {
    getAverageRating(bootcampId: string): Promise<void>;
}

class ReviewModelBuilder extends AbstractModel<IReview, IReviewModel, {}> {
    private static obj: ReviewModelBuilder;
    private constructor() {
        const modelName = 'Review';
        super(modelName);
        this.addIndexing();
    }

    protected getSchema(): Schema<IReview, IReviewModel> {
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
    private addIndexing(): this {
        this.schema.index({ bootcamp: 1, user: 1 }, { unique: true });
        return this;
    }

    protected staticsInit(): this {
        this.getAverageRating();
        return this;
    }

    protected hookInit(): this {
        this.updateAverageRatingOnSave().updateAverageRatingOnRemove();
        return this;
    }

    private updateAverageRatingOnSave(): this {
        this.schema.post('save', async function () {
            await Review.getAverageRating(this.bootcamp);
        })

        return this;
    }

    private updateAverageRatingOnRemove(): this {
        this.schema.pre('remove', { document: true, query: false }, async function () {
            await Review.getAverageRating(this.bootcamp);
        })

        return this;
    }


    private getAverageRating(): this {
        this.schema.statics.getAverageRating = async function (bootcampId: string) {
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

        return this;
    }


    public static getInstance(): ReviewModelBuilder {
        if (!this.obj) {
            this.obj = new ReviewModelBuilder();
        }
        return this.obj;
    }

}

const Review = ReviewModelBuilder.getInstance().getModel();
export default Review;