import mongoose from "mongoose";
const FeedbackSchema = new mongoose.Schema({
  Category: Number,
  suggestion: Number,
  files: [String], // Array of image URLs
  feedback: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});


const Feedback = mongoose.model("Feedback", FeedbackSchema);
export default Feedback;