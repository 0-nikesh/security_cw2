import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const folder = req.folder || "general"; // Fallback to "general" if no folder is specified
        return {
            folder,
            allowed_formats: ["jpg", "jpeg", "png"],
            public_id: `${Date.now()}-${file.originalname}`, // Unique file name
        };
    },
});

const upload = multer({ storage });

export default upload;
