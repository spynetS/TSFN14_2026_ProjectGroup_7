import mongoose from "mongoose";
import logger from "../utils/logger";

export async function init(uri: string) {
		await mongoose.connect(uri);
}
