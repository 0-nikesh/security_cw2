import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  caption: String,
  category: String,
  images: [String], // Array to store multiple Cloudinary URLs
  created_at: { type: Date, default: Date.now },
  like_count: { type: Number, default: 0 },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who commented
      text: { type: String, required: true }, // Comment text
      createdAt: { type: Date, default: Date.now }, // Timestamp
    },
  ],
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  liked_by: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Track users who liked the post
});

const Post = mongoose.model('Post', PostSchema);
export default Post;
