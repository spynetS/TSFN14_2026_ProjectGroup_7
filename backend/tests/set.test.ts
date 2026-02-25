import request from "supertest";
import mongoose from "mongoose";
import app from "../src/index";
import Set from "../src/models/Set";
import ExerciseTemplate from "../src/models/ExerciseTemplate";
import User from "../src/models/User"; // Import User model
import bcrypt from "bcrypt"; // Import bcryptd

describe("Set API", () => {
		let agent: request.SuperTest<request.Test>;
		let userId: mongoose.Types.ObjectId;

		beforeEach(async () => {
				// 1. Create a user directly in the DB
				const password = "password123";
				const user = await User.create({
						name: "testuser",
						email: "test@test.com",
						password: await bcrypt.hash(password, 10),
						friendCode: "12345",
				});
				userId = user._id;
				// 2. Create an agent and login to establish a session
				agent = request.agent(app);
				await agent.post("/api/login").send({
						email: "test@test.com",
						password: password,
				});
		});


		describe("GET /set", () => {
				it("should return all sets for the user", async () => {
						// Seed some sets
						await Set.create([
								{
										reps: 10,
										weight: 50,
										duration: 60,
										user: userId,
										template: new mongoose.Types.ObjectId(),
								},
								{
										reps: 8,
										weight: 60,
										duration: 50,
										user: userId,
										template: new mongoose.Types.ObjectId(),
								},
						]);

						const res = await agent.get('/api/set').send({
								user:userId
						});
						
						expect(res.statusCode).toBe(200);
						expect(res.body.data).toHaveLength(2);
						expect(res.body.data[0]).toHaveProperty("reps", 10);
				});
		})


		describe("POST /api/set", () => {
				it("should create a new set", async () => {

						const template = await ExerciseTemplate.create({
								title: "bla",
								description: "bla",
								muscleGroups: [""],
								exerciseType: "bla",
								creator: userId
						});
						
						const res = await agent.post("/api/set").send({
								reps: 12,
								weight: 70,
								duration: 45,
								user: userId,
								userId: userId,
								template: template._id.toHexString(),
						});

						expect(res.statusCode).toBe(200);
						// expect(res.body.data).toHaveProperty("reps", 12);
						// 
						// const created = await Set.findOne({ user: userId });
						// expect(created).not.toBeNull();
						// expect(created?.weight).toBe(70);
				});
		});

		describe("DELETE /api/set", () => {
				it("should delete a set by id", async () => {
						const set = await Set.create({
								reps: 5,
								weight: 40,
								duration: 30,
								user: userId,
								template: new mongoose.Types.ObjectId(),
						});

						const res = await agent
								.delete("/api/set")
								.send({
										id: set._id.toHexString()
								});

						expect(res.statusCode).toBe(200);
						const deleted = await Set.findById(set._id);
						expect(deleted).toBeNull();
				});

				it("should return error if id is missing", async () => {
						const res = await request(app).delete("/api/set").send({});
						expect(res.body.status).toBe("fail");
						//expect(res.body.message).toBe('No id was provided!');
				});
		});
});
