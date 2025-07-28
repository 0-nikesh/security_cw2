import crypto from "crypto";
import User from "../model/User.js"; // Change require to import
import sendEmail from "../utils/emailSender.js";
import { generateEmailTemplate } from "../utils/generateEmailTemplate.js";
import generatePasswordResetEmail from "../utils/generateResetEmailTemplate.js"; // Import the updated email template
import generateToken from "../utils/generateToken.js"; // Change require to import
import { hashPassword, matchPassword } from "../utils/hashPassword.js"; // Change require to import
import upload from "../utils/multer.js"; // Ensure multer is set up properly

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const registerUser = async (req, res) => {
  try {
    const { fname, lname, email, password, isAdmin, bio, description } = req.body;

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character."
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Generate OTP
    const otp = crypto.randomBytes(3).toString("hex").slice(0, 6); // 6-character OTP
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Handle profile image (if uploaded)
    let profileImage = null;
    if (req.file) {
      profileImage = req.file.path; // Cloudinary URL
    }

    // Create new user
    const newUser = new User({
      fname,
      lname,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
      otp,
      otpExpiresAt,
      image: profileImage, // Save the profile image URL
      bio: bio || "", // Optional field
      description: description || "", // Optional field
      passwordChangedAt: new Date(),
      passwordHistory: [hashedPassword],
    });

    // Save the user to the database
    await newUser.save();

    // Send OTP via email
    const emailHtml = generateEmailTemplate(otp);
    await sendEmail(
      email,
      "Your OTP for Registration",
      `Your OTP is: ${otp}. It will expire in 10 minutes.`,
      emailHtml
    );

    res.status(201).json({
      message: "OTP sent to your email. Please verify your account.",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


const verifyOtp = async (req, res) => {
  const { email, otp } = req.body; // Accept email instead of userId

  console.log("Verify Attempted", req.body);

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the OTP matches and is not expired
    if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP is valid; clear the OTP fields and mark the user as verified
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.isVerified = true; // Mark the user as verified
    await user.save();

    // Respond with a success message and token
    res.status(200).json({
      message: "Account verified successfully",
      token: generateToken(user._id), // Generate token for login
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" }); // Unauthorized
    }

    // Check if the account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const waitTime = Math.ceil((user.lockUntil - Date.now()) / 1000);
      return res.status(403).json({
        message: `Account is locked. Please try again after ${waitTime} seconds.`,
      });
    }

    // Check if the password has expired (1 month duration)
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    if (user.passwordChangedAt && user.passwordChangedAt < oneMonthAgo) {
      return res.status(403).json({
        message: "Your password has expired. Please update your password to continue.",
      });
    }

    // Check if the password matches
    const isPasswordMatch = await matchPassword(password, user.password);
    if (!isPasswordMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock the account if login attempts exceed 5
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 1 * 60 * 1000; // Lock for 1 minute
        await user.save();
        return res.status(403).json({
          message: "Account locked due to too many failed login attempts. Please try again later.",
        });
      }

      await user.save();
      return res.status(401).json({ message: "Invalid email or password" }); // Unauthorized
    }

    // Reset login attempts and lockUntil on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Generate and return the token with user details
    res.json({
      token: generateToken(user._id, user.isAdmin), // Include isAdmin in the token
      user: {
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin, // Include isAdmin field
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" }); // Internal server error
  }
};


// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Admins can see all users
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// Get User by ID
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) res.json(user);
  else res.status(404).json({ message: "User not found" });
};

// Delete User
const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (user) res.json({ message: "User deleted successfully" });
  else res.status(404).json({ message: "User not found" });
};

const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};


const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find user with the reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password and update user
    user.password = await hashPassword(newPassword);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Generate the reset link
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // Use the new email template
    const emailHtml = generatePasswordResetEmail(resetLink, user.fname);

    // Send the email
    await sendEmail(email, "Password Reset Request", emailHtml);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    console.log("Authenticated User:", req.user);
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      bio: user.bio,
      image: user.image,
      cover: user.cover,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user profile", error: error.message });
  }
};

const getUserProfilePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch user profile details (excluding password)
    const user = await User.findById(id).select("fname lname email image cover location bio");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
};

const updateUserProfile = async (req, res) => {
  req.folder = `user-profile/${req.user.id}`;

  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ])(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).json({ message: "File upload failed", error: err });
    }

    try {
      const { bio } = req.body;
      const updates = {};

      if (req.files && req.files.profileImage && req.files.profileImage[0]) {
        updates.image = req.files.profileImage[0].path;
      }

      if (req.files && req.files.coverImage && req.files.coverImage[0]) {
        updates.cover = req.files.coverImage[0].path;
      }

      if (bio) {
        updates.bio = bio;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "Nothing to update" });
      }

      const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true });

      res.status(200).json({
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error.message);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
};



export { deleteUser, getAllUsers, getProfile, getUserById, getUserProfile, getUserProfilePost, loginUser, registerUser, requestPasswordReset, resetPassword, updateUserProfile, verifyOtp }; // Change module.exports to export

