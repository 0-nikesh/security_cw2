import { expect } from "chai";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app.js"; // Ensure this is the correct path to your app
import Guidance from "../model/Guidance.js";
import User from "../model/User.js";
import generateToken from "../utils/generateToken.js";

// Dummy admin user & token
let adminUser;
let adminToken;

describe("Guidance API", () => {
    before(async () => {
        // Connect to test DB
        await mongoose.connect(process.env.MONGO_URI_TEST, { useNewUrlParser: true, useUnifiedTopology: true });

        // Cleanup previous test data
        await Guidance.deleteMany({});
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
        await Guidance.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    let guidanceId; // To store created guidance ID

    describe("POST /api/guidances/post", () => {
        it("should create a new guidance (Admin only)", async () => {
            const res = await request(app)
                .post("/api/guidances/post")
                .set("Authorization", `Bearer ${adminToken}`)
                .field("title", "How to Apply for Citizenship")
                .field("description", "Step-by-step guide for applying for citizenship")
                .field("category", "Citizenship")
                .field("documents_required", "Passport, Birth Certificate")
                .attach("thumbnail", "test/test-image.jpg") // Replace with an actual test image
                .expect(201);

            expect(res.body).to.have.property("_id");
            expect(res.body.title).to.equal("How to Apply for Citizenship");
            guidanceId = res.body._id; // Store for later use
        });

        it("should return 400 if required fields are missing", async () => {
            const res = await request(app)
                .post("/api/guidances/post")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    title: "",
                    description: "",
                    category: "Health"
                })
                .expect(400);

            expect(res.body.message).to.equal("All fields are required, including the thumbnail.");
        });

        it("should return 403 if a non-admin user tries to create guidance", async () => {
            const user = await User.create({
                fname: "Test",
                lname: "User",
                email: "user@example.com",
                password: "Password123!",
                isAdmin: false
            });

            const userToken = generateToken(user._id);

            const res = await request(app)
                .post("/api/guidances/post")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    title: "Health Guide",
                    description: "How to get medical insurance",
                    category: "Health",
                    documents_required: ["ID Card"]
                })
                .expect(403);

            expect(res.body.message).to.equal("Not authorized as an admin");
        });
    });

    describe("GET /api/guidances/getall", () => {
        it("should fetch all guidances", async () => {
            const res = await request(app).get("/api/guidances/getall").expect(200);

            expect(res.body).to.be.an("array");
            expect(res.body.length).to.be.greaterThan(0);
        });
    });

    describe("GET /api/guidances/:id", () => {
        it("should fetch guidance by ID", async () => {
            const res = await request(app).get(`/api/guidances/${guidanceId}`).expect(200);

            expect(res.body).to.have.property("_id");
            expect(res.body.title).to.equal("How to Apply for Citizenship");
        });

        it("should return 404 for non-existent guidance", async () => {
            const res = await request(app).get(`/api/guidances/65fd3a5a10baf35a8f9a3b44`).expect(404);

            expect(res.body.message).to.equal("Guidance not found.");
        });
    });

    describe("PUT /api/guidances/:id", () => {
        it("should update guidance details (Admin Only)", async () => {
            const res = await request(app)
                .put(`/api/guidances/${guidanceId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    title: "Updated Guidance Title"
                })
                .expect(200);

            expect(res.body.message).to.equal("Guidance updated successfully");
            expect(res.body.guidance.title).to.equal("Updated Guidance Title");
        });

        it("should return 404 if guidance not found", async () => {
            const res = await request(app)
                .put(`/api/guidances/65fd3a5a10baf35a8f9a3b44`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    title: "Non-existent Guidance"
                })
                .expect(404);

            expect(res.body.message).to.equal("Guidance not found");
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
                .put(`/api/guidances/${guidanceId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ title: "Unauthorized Update" })
                .expect(403);

            expect(res.body.message).to.equal("Not authorized as an admin");
        });
    });

    describe("PUT /api/guidances/:id/document-tracking", () => {
        it("should update document tracking status", async () => {
            const res = await request(app)
                .put(`/api/guidances/${guidanceId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    document: "Passport",
                    isChecked: true
                })
                .expect(200);

            expect(res.body.message).to.equal("Tracking status updated successfully");
        });

        it("should return 404 if document not found", async () => {
            const res = await request(app)
                .put(`/api/guidances/${guidanceId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    document: "NonExistentDoc",
                    isChecked: true
                })
                .expect(404);

            expect(res.body.message).to.equal("Document not found");
        });
    });
});
