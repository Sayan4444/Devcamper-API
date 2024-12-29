import { bgCyan, bgRed, bgGreen } from 'colors';
import mongoose, { Model, Schema } from 'mongoose';
import slugify from 'slugify';
import Cource from './Course';
import IBootcamp from '../types/models/Bootcamp';
import AbstractModel from './AbstractModel';

interface IBootcampModel extends Model<IBootcamp> {
}

class BootcampModelBuilder extends AbstractModel<IBootcamp, IBootcampModel, {}> {
    private static obj: BootcampModelBuilder;
    private constructor() {
        const modelName = 'Bootcamp';
        super(modelName);
        this.virtualInit();
    }

    protected getSchema() {
        return new Schema<IBootcamp>({
            name: {
                type: String,
                required: [true, 'Please add a name'],
                unique: true,
                trim: true,
                maxlength: [50, 'Name can not be more than 50 characters']
            },
            slug: String,
            description: {
                type: String,
                required: [true, 'Please add a description'],
                maxlength: [500, 'Description can not be more than 500 characters']
            },
            website: {
                type: String,
                match: [
                    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                    'Please use a valid URL with HTTP or HTTPS'
                ]
            },
            phone: {
                type: String,
                maxlength: [20, 'Phone number can not be longer than 20 characters']
            },
            email: {
                type: String,
                match: [
                    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    'Please add a valid email'
                ]
            },
            address: {
                type: String,
                required: [true, 'Please add an address']
            },
            location: {
                // GeoJSON Point
                type: {
                    type: String,
                    enum: ['Point']
                },
                coordinates: {
                    type: [Number],
                    index: '2dsphere'
                },
                formattedAddress: String,
                street: String,
                city: String,
                state: String,
                zipcode: String,
                country: String
            },
            careers: {
                // Array of strings
                type: [String],
                required: true,
                enum: [
                    'Web Development',
                    'Mobile Development',
                    'UI/UX',
                    'Data Science',
                    'Business',
                    'Other'
                ]
            },
            averageRating: {
                type: Number,
                min: [1, 'Rating must be at least 1'],
                max: [10, 'Rating must can not be more than 10']
            },
            averageCost: Number,
            photo: {
                type: String,
                default: 'no-photo.jpg'
            },
            housing: {
                type: Boolean,
                default: false
            },
            jobAssistance: {
                type: Boolean,
                default: false
            },
            jobGuarantee: {
                type: Boolean,
                default: false
            },
            acceptGi: {
                type: Boolean,
                default: false
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User',
                required: true
            },
        }, {
            toJSON: { virtuals: true },
            toObject: { virtuals: true }
        });
    }

    protected hookInit() {
        this
            .generateSlug()
            .getGeocodeAddress()
            .deleteBootcampCoursesOnRemove();

        return this;
    }

    private generateSlug(): this {
        this.schema.pre('save', function (next) {
            this.slug = slugify(this.name, { lower: true });
            next();
        });

        return this;
    }

    private getGeocodeAddress(): this {
        this.schema.pre('save', async function (next) {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${this.address}&format=json&addressdetails=1`);

            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon, address } = data[0];
                const { road, city, state, postcode, country, country_code } = address;
                const formattedAddress = `${road}, ${city}, ${state} ${postcode}, ${country}`;
                this.location.type = 'Point';
                this.location.formattedAddress = formattedAddress;
                this.location.street = road;
                this.location.city = city;
                this.location.state = state;
                this.location.zipcode = postcode;
                this.location.country = country;
                this.location.coordinates = [lon, lat];

            } else {
                console.error(`Could not geocode address: ${this.address}`);
            }
            next();
        })
        return this;
    }


    private deleteBootcampCoursesOnRemove(): this {
        this.schema.pre('remove', { document: true, query: false }, async function (next) {
            await Cource.deleteMany({ bootcamp: this.id })
            next();
        })
        return this;
    }

    private virtualInit() {
        this.schema.virtual('courses', {
            ref: 'Course',
            localField: '_id',
            foreignField: 'bootcamp',
            justOne: false
        })

        return this;
    }

    public static getInstance(): BootcampModelBuilder {
        if (!this.obj) {
            this.obj = new BootcampModelBuilder();
        }
        return this.obj;
    }
}

const Bootcamp = BootcampModelBuilder.getInstance().getModel();
export default Bootcamp;
