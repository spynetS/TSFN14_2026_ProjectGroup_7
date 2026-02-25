import request from "supertest";
import mongoose from "mongoose";
import app from "../src/index";
import friends from "../src/models/user.friends";
import friendCode from "../src/models/user.friends";
import User from "../src/models/User";
import test = require("node:test");
import bcrypt from "bcrypt";



describe("friend api", () => {
            let agent: request.SuperTest<request.Test>;
            let userId1: mongoose.Types.ObjectId;
            let userId2: mongoose.Types.ObjectId;
            let userId3: mongoose.Types.ObjectId;

            let user1: any;
            let user2: any;
            let user3: any;

            beforeEach(async () => {
                //create 3 user that can be friends
                const password1= "Pizza1234"
                const password2 = "Pizza12345"
                const password3 = "Pizza123456"

                user1 = await User.create({
                    name: "testuser1",
                    email: "test1@test.com",
                    password: await bcrypt.hash(password1,10),
                    friendCode: "1234567",

                });
                user2 = await User.create({
                    name: "testuser2",
                    email: "test2@test.com",
                    password: await bcrypt.hash(password2,10),
                    friendCode: "12345678",

                });
                user3 = await User.create({
                    name: "testuser3",
                    email: "test3@test.com",
                    password: await bcrypt.hash(password3,10),
                    friendCode: "123456789",

                });

                userId1 = user1._id;
                userId2 = user2._id;
                userId3 = user3._id;
                agent = request.agent(app);
                await agent.post("/api/login").send({
                        email: "test@test.com",
                        password: "password",
                });
            });

            describe("GET /friendlist", () => {
                it("should return list of friends",async () => {

                    user1.friends.push(user2._id as string);
                    
                    user2.friends.push(user1._id as string);
                    user1.friends.push(user3._id as string);
                    await user1.save();
                    await user2.save();
                    await user3.save();
                    console.log(userId1);
                    const res = await agent.get('/api/friends').send({
                            user: userId1
                    });


                    expect(res.statusCode).toBe(200);
                    expect(res.body.data.friends).toHaveLength(2);
                })
            });
});

