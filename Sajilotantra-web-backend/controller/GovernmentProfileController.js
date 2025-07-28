import GovernmentProfile from "../model/GovernmentProfile.js";

const createGovernmentProfile = async (req, res) => {
    // Set Cloudinary folder for government profile images
    req.folder = "government_profiles";
  
    try {
      const { name, description, address, latitude, longitude } = req.body;
  
      // Ensure all required fields are provided
      if (!name || !description || !address || !latitude || !longitude || !req.file) {
        return res.status(400).json({ message: "All fields are required, including the thumbnail." });
      }
  
      // Multer uploads the image to Cloudinary, use the Cloudinary URL from req.file.path
      const thumbnailUrl = req.file.path;
  
      // Create the new government profile with the authenticated user's ID from the token
      const profile = await GovernmentProfile.create({
        name,
        thumbnail: thumbnailUrl, // Cloudinary URL
        description,
        address,
        latitude,
        longitude,
        user_id: req.user._id, // Get the user ID from the authenticated request
      });
  
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating government profile:", error.message);
      res.status(500).json({ message: "Failed to create government profile.", error: error.message });
    }
  };
  

// Get all government profiles
const getAllGovernmentProfiles = async (req, res) => {
    try {
        const profiles = await GovernmentProfile.find().populate("user_id", "fname lname email");
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch government profiles", error: error.message });
    }
};

// Get a single government profile by ID
const getGovernmentProfileById = async (req, res) => {
    try {
      const profile = await GovernmentProfile.findById(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: "Government profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching government profile:", error.message);
      res.status(500).json({ message: "Failed to fetch government profile.", error: error.message });
    }
  };
  

// Update a government profile
const updateGovernmentProfile = async (req, res) => {
    // Set Cloudinary folder for government profile images
    req.folder = "government_profiles";

    try {
        const { name, description, address, latitude, longitude } = req.body;

        const profile = await GovernmentProfile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ message: "Government profile not found" });
        }

        // Update fields
        profile.name = name || profile.name;
        profile.description = description || profile.description;
        profile.address = address || profile.address;
        profile.latitude = latitude || profile.latitude;
        profile.longitude = longitude || profile.longitude;

        // Handle thumbnail update
        if (req.file) {
            profile.thumbnail = req.file.path; // Use Cloudinary URL from req.file.path
        }

        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error("Error updating government profile:", error.message);
        res.status(500).json({ message: "Failed to update government profile.", error: error.message });
    }
};


// Delete a government profile
const deleteGovernmentProfile = async (req, res) => {
    try {
        const profile = await GovernmentProfile.findByIdAndDelete(req.params.id);
        if (!profile) {
            return res.status(404).json({ message: "Government profile not found" });
        }
        res.json({ message: "Government profile deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete government profile", error: error.message });
    }
};

const findNearestLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Latitude and longitude are required." });
        }

        const nearestLocations = await GovernmentProfile.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)],
                    },
                    distanceField: "distance",
                    spherical: true,
                    maxDistance: 10000, // 10 km radius
                },
            },
        ]);

        res.status(200).json(nearestLocations);
    } catch (error) {
        console.error("Error finding nearest location:", error.message);
        res.status(500).json({ message: "Failed to find nearest location.", error: error.message });
    }
};

const addBranchToProfile = async (req, res) => {
    try {
      const { name, address, latitude, longitude } = req.body;
      const profile = await GovernmentProfile.findById(req.params.id);
  
      if (!profile) {
        return res.status(404).json({ message: "Government profile not found" });
      }
  
      profile.branches.push({ name, address, latitude, longitude });
      await profile.save();
  
      res.status(200).json(profile);
    } catch (error) {
      console.error("Error adding branch:", error.message);
      res.status(500).json({ message: "Failed to add branch.", error: error.message });
    }
  };
  

export {
    createGovernmentProfile, deleteGovernmentProfile, findNearestLocation, getAllGovernmentProfiles,
    getGovernmentProfileById,
    updateGovernmentProfile, addBranchToProfile,
};

