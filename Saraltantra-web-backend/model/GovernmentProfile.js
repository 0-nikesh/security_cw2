import mongoose from "mongoose";

const GovernmentProfileSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  thumbnail: { type: String },
  description: { type: String, required: true },
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  branches: [
    {
      name: { type: String, required: true },
      address: { type: String },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  ],
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

GovernmentProfileSchema.index({ latitude: 1, longitude: 1 }, { type: "2dsphere" });

const GovernmentProfile = mongoose.model("GovernmentProfile", GovernmentProfileSchema);
export default GovernmentProfile;

