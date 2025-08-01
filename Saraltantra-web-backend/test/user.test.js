import { expect } from "chai"; // Chai assertions
import mongoose from "mongoose";
import request from "supertest";
import { server } from "../app.js"; // ✅ Import the correct server instance
import User from "../model/User.js";

process.env.NODE_ENV = "test"; // ✅ Set test environment

describe("User API", () => {
    let userToken = "";
    let adminToken = "";
    let userId = "";

    before(async () => {
        await User.deleteMany({}); // ✅ Cleanup database before tests
    });

    describe("POST /api/users/register", () => {
        it("should register a new user", async () => {
            const res = await request(server) // ✅ Use `server`
                .post("/api/users/register")
                .send({
                    fname: "John",
                    lname: "Doe",
                    email: "john@example.com",
                    password: "Password123",
                    isAdmin: false
                });

            expect(res.status).to.equal(201);
            expect(res.body).to.be.an("object");
            expect(res.body.message).to.equal("OTP sent to your email. Please verify your account.");
            userId = res.body.userId;
        });

        it("should not register a user with existing email", async () => {
            const res = await request(server)
                .post("/api/users/register")
                .send({
                    fname: "John",
                    lname: "Doe",
                    email: "john@example.com",
                    password: "Password123",
                    isAdmin: false
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("User already exists");
        });
    });

    describe("POST /api/users/verify-otp", () => {
        it("should return error for invalid OTP", async () => {
            const res = await request(server)
                .post("/api/users/verify-otp")
                .send({ email: "john@example.com", otp: "000000" });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Invalid or expired OTP");
        });
    });

    describe("POST /api/users/login", () => {
        it("should not allow login before OTP verification", async () => {
            const res = await request(server)
                .post("/api/users/login")
                .send({ email: "john@example.com", password: "Password123" });

            expect(res.status).to.equal(403);
            expect(res.body.message).to.equal("Account not verified. Please verify your email before logging in.");
        });

        it("should return error for incorrect password", async () => {
            const res = await request(server)
                .post("/api/users/login")
                .send({ email: "john@example.com", password: "WrongPass123" });

            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal("Invalid email or password");
        });
    });

    describe("GET /api/users/profile", () => {
        it("should return unauthorized without token", async () => {
            const res = await request(server).get("/api/users/profile");

            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal("Not authorized");
        });

        it("should return user profile with valid token", async () => {
            const res = await request(server)
                .get("/api/users/profile")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).to.equal(200);
            expect(res.body.email).to.equal("john@example.com");
        });
    });

    describe("GET /api/users/all", () => {
        it("should return unauthorized for normal user", async () => {
            const res = await request(server)
                .get("/api/users/all")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).to.equal(403);
            expect(res.body.message).to.equal("Not authorized as an admin");
        });

        it("should return all users for admin", async () => {
            const res = await request(server)
                .get("/api/users/all")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
        });
    });

    describe("POST /api/users/request-password-reset", () => {
        it("should return error for unregistered email", async () => {
            const res = await request(server)
                .post("/api/users/request-password-reset")
                .send({ email: "unknown@example.com" });

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal("No account found with this email");
        });

        it("should send password reset link for registered email", async () => {
            const res = await request(server)
                .post("/api/users/request-password-reset")
                .send({ email: "john@example.com" });

            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Password reset link sent to your email");
        });
    });

    describe("DELETE /api/users/:id", () => {
        it("should return unauthorized for normal user", async () => {
            const res = await request(server)
                .delete(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).to.equal(403);
            expect(res.body.message).to.equal("Not authorized as an admin");
        });

        it("should delete user for admin", async () => {
            const res = await request(server)
                .delete(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("User deleted successfully");
        });
    });

    // ✅ Close DB & Server After Tests
    after(async () => {
        await mongoose.connection.close();
        server.close(); // ✅ Ensures port is freed after tests
    });
});
