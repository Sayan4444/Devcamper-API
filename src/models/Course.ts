import mongoose, { model, Model, Schema } from 'mongoose';
import Bootcamp from './Bootcamp';
import ICourse from '../types/models/Course';

// register the statics methods
interface ICourseModel extends Model<ICourse> {
    getAverageCost(bootcampId: string): Promise<void>;
}

class CourseModel {
    private courseSchema;
    private static instance: CourseModel;

    private constructor() {
        this.courseSchema = this.getSchema();
        this.staticsInit();
        this.hookInit();
    }

    private getSchema() {
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
    private hookInit() {
        this.postSave();
        this.preRemove();
    }

    private postSave() {
        this.courseSchema.post('save', async function () {
            Course.getAverageCost(this.bootcamp);
        })
    }

    private preRemove() {
        this.courseSchema.pre('remove', { document: true, query: false }, async function () {
            Course.getAverageCost(this.bootcamp);
        })
    }

    private staticsInit() {
        this.courseSchema.statics.getAverageCost = async function (bootcampId: string): Promise<void> {
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
    }

    public getModel() {
        return mongoose.model<ICourse, ICourseModel>('Course', this.courseSchema);
    }

    public static getInstance(): CourseModel {
        if (!this.instance) {
            this.instance = new CourseModel();
        }
        return this.instance;
    }
}

const Course = CourseModel.getInstance().getModel();
export default Course;

