export default interface ICourse {
    id: string;
    title: string;
    description: string;
    weeks: string;
    tuition: number;
    minimumSkill: string;
    scholarshipAvailable: boolean;
    createdAt: Date;
    bootcamp: mongoose.Schema.Types.ObjectId;
    user: mongoose.Schema.Types.ObjectId;
}