export default interface IBootcamp {
    id: string;
    name: string;
    slug: string;
    description: string;
    website: string;
    phone: string;
    email: string;
    address: string;
    location: {
        type: string;
        coordinates: number[];
        formattedAddress: string;
        street: string;
        city: string;
        state: string;
        zipcode: string;
        country: string;
    };
    careers: string[];
    averageRating: number;
    averageCost: Number,
    photo: string
    housing: boolean;
    jobAssistance: boolean;
    jobGuarantee: boolean;
    acceptGi: boolean;
    createdAt: Date;
    user: mongoose.Schema.Types.ObjectId;
}