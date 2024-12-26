export default interface IReview {
    id: string;
    title: string;
    text: string;
    rating: number;
    createdAt: Date;
    bootcamp: mongoose.Schema.Types.ObjectId;
    user: mongoose.Schema.Types.ObjectId;
}