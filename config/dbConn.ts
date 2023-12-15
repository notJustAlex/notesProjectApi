import mongoose from "mongoose";

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.DATABASE_URI!);
	} catch (error: any) {
		throw new Error(error);
	}
};

export default connectDB;
