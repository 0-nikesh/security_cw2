import mongoose from "mongoose";
const UserProfileSchema = new mongoose.Schema({
  image: String,
  cover: String,
  bio: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

const UserProfile = mongoose.model('UserProfile', UserProfileSchema);
export default UserProfile;
