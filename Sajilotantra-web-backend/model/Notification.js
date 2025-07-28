import mongoose from "mongoose";
const NotificationSchema = new mongoose.Schema({
  title: String,
  description: String,
  date_posted: { type: Date, default: Date.now },
  posted_by: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;