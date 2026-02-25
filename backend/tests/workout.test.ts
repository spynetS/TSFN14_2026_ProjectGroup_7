import request from "supertest";
import mongoose from "mongoose";
import Workout from "../src/models/workout";
import app from "../src/index";
import User from "../src/models/User"; // Import User model
import bcrypt from "bcrypt"; // Import bcryptd


describe("Workout API", () => {
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
				// 2. Create an agent and log in to establish a session
				agent = request.agent(app);
				await agent.post("/api/login").send({
						email: "test@test.com",
						password: password,
				});
		});

		
		describe("POST /workout", () => {
				it("should create a workout and return it", async () => {
						const res = await agent.post('/api/workout').send({
								user:userId,
								title:"Test Title",
								exercises: [],
								weekday:"Monday"
						});
						expect(res.body.status).toBe("success");
				})
				it("should return error if parameters are missing", async () => {

						// We send a body without title which should return an error
						const res = await agent.post('/api/workout').send({
								user:userId,
				 				exercises: [],
				 				weekday:"Monday"
				 		});

				 		expect(res.body.status).toBe("error");
				 		expect(res.body.message).toBe("Workout validation failed: title: Path `title` is required.");
				})
				
				it("should return error user has workouts with same name", async () => {
						// we create a workout with title test and then try to create it with the
						// end point which should become an error
						await Workout.create([{
								user:userId,
								title:"test",
				 				exercises: [],
				 				weekday:"Monday"
						}])

						const res = await agent.post('/api/workout').send({
								user:userId,
								title:"test",
				 				exercises: [],
				 				weekday:"Monday"
				 		});
						
				 		expect(res.body.status).toBe("error");
				})
		})

		describe("GET /workout", () => {
				it("should get all workouts for the user", async () => {
						// we create 2 workouts and expect them to be returned
						// from the endpoint
						await Workout.create([{
								user:userId,
								title:"test",
				 				exercises: [],
				 				weekday:"Monday"
						},{
								user:userId,
								title:"test2",
				 				exercises: [],
				 				weekday:"Monday"
						}])

						const res = await agent.get("/api/workout").send({
								user:userId
						})
						expect(res.statusCode).toBe(200)
						expect(res.body.data).toHaveLength(2)
				})
		})
		
})
