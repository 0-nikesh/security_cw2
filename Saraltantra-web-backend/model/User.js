import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: null }, // Profile Image
  cover: { type: String, default: null }, // Cover Image
  bio: { type: String, default: "" }, // Bio field
  isAdmin: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiresAt: { type: Date },
  isVerified: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  loginAttempts: { type: Number, default: 0 }, // Track failed login attempts
  lockUntil: { type: Date }, // Account lockout time
  passwordHistory: { type: [String], default: [] }, // Store previous hashed passwords
  passwordChangedAt: { type: Date }, // Track the last password change date
  mfaSecret: { type: String, default: null }, // Google Authenticator MFA secret
});

const User = mongoose.model("User", UserSchema);
export default User;

