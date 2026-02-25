import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/index";
import { init } from "../src/database/database";
import dotenv from "dotenv";


let mongoServer: MongoMemoryServer;

beforeAll(async () => {
		
		dotenv.config({ quiet: true });
		
		mongoServer = await MongoMemoryServer.create();
		const uri = mongoServer.getUri();
		await init(uri); // connect Mongoose to in-memory MongoDB
});

beforeEach(async () => {
		const collections = mongoose.connection.collections;
		for (const key in collections) {
				await collections[key].deleteMany({});
		}
});

afterAll(async () => {
		await mongoose.disconnect();
		await mongoServer.stop();
});
