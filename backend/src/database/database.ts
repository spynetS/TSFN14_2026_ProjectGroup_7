import mongoose from "mongoose";

export async function init(uri: string) {
		await mongoose.connect(uri,{
				serverSelectionTimeoutMS: 10000, // fail fast (5s)
				connectTimeoutMS: 10000,
		});
}
