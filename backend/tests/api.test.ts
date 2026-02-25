import request from "supertest";
import mongoose from "mongoose";
import app from "../src/index";
import User from "../src/models/User";
import bcrypt from "bcrypt";

describe("API Routes", () => {
    let agent: request.SuperTest<request.Test>;
    let userId: mongoose.Types.ObjectId;

    beforeEach(async () => {
        const password = "password123";
        const user = await User.create({
            name: "testuser",
            email: "test@test.com",
            password: await bcrypt.hash(password, 10),
            friendCode: "12345",
        });
        userId = user._id;
        
        agent = request.agent(app);
        await agent.post("/api/login").send({
            email: "test@test.com",
            password: password,
        });
    });

    describe("GET /api/get-user", () => {
        it("should return user data", async () => {
            const res = await agent.get("/api/get-user");
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBeDefined();
        });
    });

    describe("POST /api/signup", () => {
        it("should create a new user", async () => {
            const res = await request(app).post("/api/signup").send({
                userName: "newuser",
                email: "new@test.com",
                password: "pass123"
            });
            expect(res.statusCode).toBe(200);
        });
        // DUPLICTE FROM BEFOREEACH
        it("should fail with duplicate email", async () => {
            const res = await request(app).post("/api/signup").send({
                email: "test@test.com",
                userName: "duplicate",
                password: "pass"
            });
            expect(res.body.status).toBe("fail");
        });
    });

    describe("POST /api/login", () => {
        it("should login with correct details", async () => {
            const res = await request(app).post("/api/login").send({
                email: "test@test.com",
                password: "password123"
            });
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe("success");
        });
            
        it("should fail with wrong password", async () => {
            const res = await request(app).post("/api/login").send({
                email: "test@test.com",
                password: "wrongpassword"
            });
            expect(res.body.status).toBe("fail");
        });

        it("should fail with non-existent email", async () => {
            const res = await request(app).post("/api/login").send({
                email: "doesnotexist@test.com",
                password: "password123"
            });
            expect(res.body.status).toBe("fail");
        });
    });
});