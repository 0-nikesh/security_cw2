import mongoose from "mongoose";

const GuidanceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true }, // URL or path to the thumbnail image
  category: { type: String, required: true }, // For organizing guidance by type
  documents_required: [{ type: String }], // Array of document names
  cost_required: { type: String }, // Information about the cost
  government_profile: { type: mongoose.Schema.Types.ObjectId, ref: "GovernmentProfile" }, // Reference to a government profile
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Refers to the user/admin who created it
  createdAt: { type: Date, daefault: Date.now }, // Optional: track when the guidance was added
});

const Guidance = mongoose.model("Guidance", GuidanceSchema);
export default Guidance;
