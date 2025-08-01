import AdminJSExpress from "@adminjs/express"; // Correct import
import * as AdminJSMongoose from "@adminjs/mongoose"; // Import everything as a namespace
import AdminJS, { ComponentLoader } from "adminjs"; // Correct import
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import http from 'http'; // Built-in Node module to create an HTTP server
import path from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import connectDB from "./config/db.js";
import activityLogger from "./middleware/activityLogger.js";
import { noSqlSanitizer, strictNoSqlProtection } from "./middleware/customMongoSanitize.js";

//models import
import Feedback from "./model/Feedback.js";
import GovernmentProfile from "./model/GovernmentProfile.js";
import Guidance from "./model/Guidance.js";
import Notification from "./model/Notification.js";
import Post from "./model/Post.js";
import User from "./model/User.js";
import ActivityLog from "./model/ActivityLog.js";

const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

// Security middleware
app.use(helmet()); // Set various HTTP headers for security
app.use(xss()); // Sanitize user input coming from POST body, GET queries, and url params
app.use(noSqlSanitizer); // Advanced NoSQL injection prevention with logging
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(cookieParser());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // Limit body size to 10kb

// Activity logging middleware
app.use(activityLogger);

const corsOptions = {
  origin: [ "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

const componentLoader = new ComponentLoader();
// const CustomDashboard = componentLoader.add("CustomDashboard", "./.adminjs/components/Dashboard.js");
const CustomDashboard = componentLoader.add(
  "CustomDashboard",
  path.resolve(currentDir, ".adminjs/components/Dashboard.js")
);

console.log(path.resolve(currentDir, ".adminjs/components/Dashboard.js"));

// Register AdminJS adapter for Mongoose
AdminJS.registerAdapter(AdminJSMongoose);

// Initialize AdminJS
const adminJs = new AdminJS({
  resources: [
    {
      resource: User,
      options: {
        properties: {
          password: { isVisible: false },
          otp: { isVisible: false },
          otpExpiresAt: { isVisible: false },
          resetToken: { isVisible: false },
          resetTokenExpiry: { isVisible: false },
        },
      },
    },
    { resource: Post },
    {
      resource: Guidance,
      options: {
        properties: {
          description: {
            type: 'richtext', // Use built-in rich text editor
          },
          thumbnail: {
            type: 'richtext',
          },
        },
      },
    },
    { resource: Notification },
    { resource: GovernmentProfile },
    { resource: Feedback },
    { resource: ActivityLog },
  ],
  rootPath: '/admin',
  dashboard: {
    component: CustomDashboard,
  },
});

// Create AdminJS router
const adminRouter = AdminJSExpress.buildRouter(adminJs);

// Mount AdminJS router
app.use(adminJs.options.rootPath, adminRouter);


import feedbackRoute from "./routes/FeedbackRoute.js";
import guidanceRoute from "./routes/GuidanceRoute.js";
import notificationRoute from "./routes/NotificationRoute.js";
import postRoute from "./routes/PostRoute.js";
// import userProfileRoute from "./routes/UserProfileRoute.js";
import governmentRoute from "./routes/GovernmentProfileRoute.js";
import userRoute from "./routes/UserRoute.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import mfaRoute from "./routes/MfaRoute.js";


app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/guidances", guidanceRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/feedbacks", feedbackRoute);
app.use("/api/government", governmentRoute);
app.use("/api/payment", paymentRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/mfa", mfaRoute);

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    socket.join(userId);
    console.log(`User ${userId} connected to room`);
  }

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});


export default io;

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`AdminJS running at http://localhost:${PORT}/admin`);
});