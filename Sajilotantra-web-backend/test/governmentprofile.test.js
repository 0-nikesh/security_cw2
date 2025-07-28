import { expect } from "chai";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app.js"; // Ensure this is the correct path to your app
import GovernmentProfile from "../model/GovernmentProfile.js";
import User from "../model/User.js";
import generateToken from "../utils/generateToken.js";

// Dummy admin user & token
let adminUser;
let adminToken;

describe("Government Profile API", () => {
    before(async () => {
        // Connect to test DB
        await mongoose.connect(process.env.MONGO_URI_TEST, { useNewUrlParser: true, useUnifiedTopology: true });

        // Cleanup previous test data
        await GovernmentProfile.deleteMany({});
        await User.deleteMany({});

        // Create admin user for testing
        adminUser = await User.create({
            fname: "Test",
            lname: "Admin",
            email: "admin@example.com",
            password: "Password123!",
            isAdmin: true
        });

        adminToken = generateToken(adminUser._id);
    });

    after(async () => {
        // Clean up test data
        await GovernmentProfile.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    let governmentProfileId; // To store created Government Profile ID

    describe("POST /api/government/create", () => {
        it("should create a new government profile (Admin only)", async () => {
            const res = await request(app)
                .post("/api/government/create")
                .set("Authorization", `Bearer ${adminToken}`)
                .field("name", "Department of Transport")
                .field("description", "Handles vehicle registration and licensing")
                .field("address", "123 Main Street")
                .field("latitude", "27.700769")
                .field("longitude", "85.300140")
                .attach("thumbnail", "test/test-image.jpg") // Replace with an actual test image
                .expect(201);

            expect(res.body).to.have.property("_id");
            expect(res.body.name).to.equal("Department of Transport");
            governmentProfileId = res.body._id; // Store for later use
        });

        it("should return 400 if required fields are missing", async () => {
            const res = await request(app)
                .post("/api/government/create")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "",
                    description: "",
                    address: "No Address"
                })
                .expect(400);

            expect(res.body.message).to.equal("All fields are required, including the thumbnail.");
        });

        it("should return 403 if a non-admin user tries to create a government profile", async () => {
            const user = await User.create({
                fname: "Test",
                lname: "User",
                email: "user@example.com",
                password: "Password123!",
                isAdmin: false
            });

            const userToken = generateToken(user._id);

            const res = await request(app)
                .post("/api/government/create")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    name: "Health Department",
                    description: "Manages healthcare services",
                    address: "Hospital Road"
                })
                .expect(403);

            expect(res.body.message).to.equal("Not authorized as an admin");
        });
    });

    describe("GET /api/government", () => {
        it("should fetch all government profiles", async () => {
            const res = await request(app).get("/api/government").set("Authorization", `Bearer ${adminToken}`).expect(200);

            expect(res.body).to.be.an("array");
            expect(res.body.length).to.be.greaterThan(0);
        });
    });

    describe("GET /api/government/:id", () => {
        it("should fetch a government profile by ID", async () => {
            const res = await request(app).get(`/api/government/${governmentProfileId}`).set("Authorization", `Bearer ${adminToken}`).expect(200);

            expect(res.body).to.have.property("_id");
            expect(res.body.name).to.equal("Department of Transport");
        });

        it("should return 404 for non-existent government profile", async () => {
            const res = await request(app).get(`/api/government/65fd3a5a10baf35a8f9a3b44`).set("Authorization", `Bearer ${adminToken}`).expect(404);

            expect(res.body.message).to.equal("Government profile not found");
        });
    });

    describe("PUT /api/government/:id", () => {
        it("should update a government profile (Admin Only)", async () => {
            const res = await request(app)
                .put(`/api/government/${governmentProfileId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Updated Department of Transport"
                })
                .expect(200);

            expect(res.body.name).to.equal("Updated Department of Transport");
        });

        it("should return 404 if government profile not found", async () => {
            const res = await request(app)
                .put(`/api/government/65fd3a5a10baf35a8f9a3b44`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Non-existent Profile"
                })
                .expect(404);

            expect(res.body.message).to.equal("Government profile not found");
        });

        it("should return 403 if non-admin tries to update", async () => {
            const user = await User.create({
                fname: "Test",
                lname: "User",
                email: "user@example.com",
                password: "Password123!",
                isAdmin: false
            });

            const userToken = generateToken(user._id);

            const res = await request(app)
                .put(`/api/government/${governmentProfileId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ name: "Unauthorized Update" })
                .expect(403);

            expect(res.body.message).to.equal("Not authorized as an admin");
        });
    });

    describe("GET /api/government/nearest", () => {
        it("should fetch nearest government profiles", async () => {
            const res = await request(app)
                .get("/api/government/nearest?latitude=27.700769&longitude=85.300140")
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.be.an("array");
        });

        it("should return 400 if latitude and longitude are missing", async () => {
            const res = await request(app).get("/api/government/nearest").set("Authorization", `Bearer ${adminToken}`).expect(400);

            expect(res.body.message).to.equal("Latitude and longitude are required.");
        });
    });

    describe("DELETE /api/government/:id", () => {
        it("should delete a government profile (Admin only)", async () => {
            const res = await request(app).delete(`/api/government/${governmentProfileId}`).set("Authorization", `Bearer ${adminToken}`).expect(200);

            expect(res.body.message).to.equal("Government profile deleted successfully");
        });

        it("should return 404 if government profile not found", async () => {
            const res = await request(app).delete(`/api/government/${governmentProfileId}`).set("Authorization", `Bearer ${adminToken}`).expect(404);

            expect(res.body.message).to.equal("Government profile not found");
        });
    });
});
