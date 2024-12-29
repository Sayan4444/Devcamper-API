import mongoose, { model, Model, Schema } from 'mongoose';
import Bootcamp from './Bootcamp';
import ICourse from '../types/models/Course';
import AbstractModel from './AbstractModel';

// register the statics methods
interface ICourseModel extends Model<ICourse> {
    getAverageCost(bootcampId: string): Promise<void>;
}

class CourseModelBuilder extends AbstractModel<ICourse, ICourseModel, {}> {
    private static obj: CourseModelBuilder;
    private constructor() {
        const modelName = 'Course';
        super(modelName);
    }

    protected getSchema(): Schema<ICourse, ICourseModel> {
        return new Schema<ICourse, ICourseModel>({
            title: {
                type: String,
                trim: true,
                required: [true, 'Please add a course title']
            },
            description: {
                type: String,
                required: [true, 'Please add a description']
            },
            weeks: {
                type: String,
                required: [true, 'Please add number of weeks']
            },
            tuition: {
                type: Number,
                required: [true, 'Please add a tuition cost']
            },
            minimumSkill: {
                type: String,
                required: [true, 'Please add a minimum skill'],
                enum: ['beginner', 'intermediate', 'advanced']
            },
            scholarshipAvailable: {
                type: Boolean,
                default: false
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

    protected hookInit(): this {
        this.updateAverageRatingOnSave().updateAverageRatingOnRemove();
        return this;
    }

    private updateAverageRatingOnSave(): this {
        this.schema.post('save', async function () {
            await Course.getAverageCost(this.bootcamp);
        })

        return this;
    }

    private updateAverageRatingOnRemove(): this {
        this.schema.pre('remove', { document: true, query: false }, async function () {
            await Course.getAverageCost(this.bootcamp);
        })

        return this;
    }

    protected staticsInit(): this {
        this.getAverageCost();
        return this;
    }

    private getAverageCost(): this {
        this.schema.statics.getAverageCost = async function (bootcampId: string): Promise<void> {
            try {
                const obj = await this.aggregate([
                    {
                        $match: { bootcamp: bootcampId },
                    },
                    {
                        $group: {
                            _id: '$bootcamp',
                            averageCost: { $avg: '$tuition' }
                        }
                    }
                ])
                await Bootcamp.findByIdAndUpdate(bootcampId, {
                    averageCost: Math.ceil(obj[0].averageCost)
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

    public static getInstance(): CourseModelBuilder {
        if (!this.obj) {
            this.obj = new CourseModelBuilder();
        }
        return this.obj;
    }
}

const Course = CourseModelBuilder.getInstance().getModel();
export default Course;

