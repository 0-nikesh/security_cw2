import User from "../model/User.js";
import UserProfile from "../model/UserProfile.js";
import upload from "../utils/multer.js";

// Get the profile of the authenticated user
const getUserProfile = async (req, res) => {
  try {
    // Find user and their profile details
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    const userProfile = await UserProfile.findOne({ user_id: req.user.id });

    if (user) {
      res.json({
        id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        bio: userProfile ? userProfile.bio : "", // Get bio from UserProfile model
        image: userProfile ? userProfile.image : "", // Get image from UserProfile model
        cover: userProfile ? userProfile.cover : "", // Get cover from UserProfile model
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update the profile of the authenticated user
const updateUserProfile = async (req, res) => {
  // Define the folder for Cloudinary dynamically based on user ID
  req.folder = `user-profile/${req.user.id}`; // Cloudinary folder for user profiles

  // Multer middleware for handling file uploads
  upload.fields([
    { name: "profileImage", maxCount: 1 }, // Accept 1 profile image
    { name: "coverImage", maxCount: 1 }, // Accept 1 cover image
  ])(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).json({ message: "File upload failed", error: err });
    }

    try {
      const { bio } = req.body; // Other fields in the request body
      const updates = {};

      console.log("Request body:", req.body);
      console.log("Uploaded files:", req.files);

      // Update profile image if provided
      if (req.files && req.files.profileImage && req.files.profileImage[0]) {
        updates.image = req.files.profileImage[0].path; // Cloudinary URL for profile image
      }

      // Update cover image if provided
      if (req.files && req.files.coverImage && req.files.coverImage[0]) {
        updates.cover = req.files.coverImage[0].path; // Cloudinary URL for cover image
      }

      // Update bio or other fields
      if (bio) {
        updates.bio = bio;
      }

      // Ensure the user is updating their own profile
      const userProfile = await UserProfile.findOne({ user_id: req.user.id });
      if (!userProfile && Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "Nothing to update" });
      }

      // Find and update the user profile
      const updatedProfile = await UserProfile.findOneAndUpdate(
        { user_id: req.user.id },
        updates,
        { new: true, upsert: true }
      );

      res.status(200).json({
        message: "Profile updated successfully",
        data: updatedProfile,
      });
    } catch (error) {
      console.error("Error updating profile:", error.message);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
};

export { getUserProfile, updateUserProfile };

