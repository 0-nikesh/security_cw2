import Guidance from "../model/Guidance.js";
// Create a new guidance (Admin-only action)
// const createGuidance = async (req, res) => {
//   try {
//     const { title, description, thumbnail, category, documents_required } = req.body;

//     // Ensure all required fields are provided
//     if (!title || !description || !thumbnail || !category || !documents_required) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     // Create guidance document
//     const guidance = await Guidance.create({
//       title,
//       description,
//       thumbnail,
//       category,
//       documents_required,
//       user_id: req.user._id, // Assuming `req.user` contains the authenticated admin's details
//     });

//     res.status(201).json(guidance);
//   } catch (error) {
//     console.error("Error creating guidance:", error.message);
//     res.status(500).json({ message: "Failed to create guidance.", error: error.message });
//   }
// };

const createGuidance = async (req, res) => {
  // Set Cloudinary folder for guidance images
  req.folder = `guidance/${req.user.id}`;  // This ensures images go into the "guidance" folder in Cloudinary

  try {
    const { title, description, category, documents_required, cost_required, government_profile } = req.body;

    // Ensure all required fields are provided
    if (!title || !description || !category || !documents_required || !req.file) {
      return res.status(400).json({ message: "All fields are required, including the thumbnail." });
    }

    // Multer already uploads the image to Cloudinary, get the URL from req.file
    const thumbnailUrl = req.file.path;

    // Create the guidance document in the database
    const guidance = await Guidance.create({
      title,
      description,
      thumbnail: thumbnailUrl, // Cloudinary URL for the image
      category,
      cost_required,
      documents_required: documents_required.split(",").map((doc) => doc.trim()), // Convert to an array if sent as a comma-separated string
      government_profile, // This should be the ObjectId of the related GovernmentProfile
      user_id: req.user._id, // Use the logged-in user/admin ID
    });

    res.status(201).json(guidance);
  } catch (error) {
    console.error("Error creating guidance:", error.message);
    res.status(500).json({ message: "Failed to create guidance.", error: error.message });
  }
};


// Get all guidances (Accessible to all users)
const getAllGuidances = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    // Apply filters if provided
    if (category) query.category = category;
    if (search) query.title = new RegExp(search, "i"); // Case-insensitive search

    const guidances = await Guidance.find(query);
    res.status(200).json(guidances);
  } catch (error) {
    console.error("Error fetching guidances:", error.message);
    res.status(500).json({ message: "Failed to fetch guidances.", error: error.message });
  }
};

// Get a single guidance by ID (Accessible to all users)
// Get a single guidance by ID (Accessible to all users)
const getGuidanceById = async (req, res) => {
  try {
    const guidance = await Guidance.findById(req.params.id).populate("government_profile");
    if (!guidance) {
      return res.status(404).json({ message: "Guidance not found." });
    }
    res.status(200).json(guidance);
  } catch (error) {
    console.error("Error fetching guidance by ID:", error.message);
    res.status(500).json({ message: "Failed to fetch guidance.", error: error.message });
  }
};



const updateGuidance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      thumbnail,
      category,
      documents_required,
    } = req.body;

    // Find the guidance by ID
    const guidance = await Guidance.findById(id);

    if (!guidance) {
      return res.status(404).json({ message: "Guidance not found" });
    }

    // Update fields only if provided in the request
    if (title) guidance.title = title;
    if (description) guidance.description = description;
    if (thumbnail) guidance.thumbnail = thumbnail;
    if (category) guidance.category = category;
    if (documents_required) guidance.documents_required = documents_required;

    // Save the updated guidance
    const updatedGuidance = await guidance.save();

    res.status(200).json({
      message: "Guidance updated successfully",
      guidance: updatedGuidance,
    });
  } catch (error) {
    console.error("Error updating guidance:", error.message);
    res.status(500).json({
      message: "Failed to update guidance",
      error: error.message,
    });
  }
};
const updateDocumentTracking = async (req, res) => {
  try {
    const { id } = req.params; // Guidance ID
    const { document, isChecked } = req.body; // Document name and new status

    const guidance = await Guidance.findById(id);
    if (!guidance) {
      return res.status(404).json({ message: "Guidance not found" });
    }

    // Find the document to update
    const doc = guidance.documents_required.find((d) => d.document === document);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if the user already has a tracking status for this document
    const userTracking = doc.tracking_status.find((status) => status.user.toString() === req.user._id.toString());

    if (userTracking) {
      userTracking.isChecked = isChecked; // Update existing status
    } else {
      doc.tracking_status.push({ user: req.user._id, isChecked }); // Add new status
    }

    await guidance.save();

    res.status(200).json({ message: "Tracking status updated successfully" });
  } catch (error) {
    console.error("Error updating document tracking:", error);
    res.status(500).json({ message: "Failed to update tracking status" });
  }
};


export {
  createGuidance,
  getAllGuidances,
  getGuidanceById, updateDocumentTracking, updateGuidance
};

