
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";
import mime from "mime-types";

// Allowed mime types and extensions
const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
const allowedExtensions = [".jpg", ".jpeg", ".png"];

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const folder = req.folder || "general"; // Fallback to "general" if no folder is specified
        return {
            folder,
            allowed_formats: ["jpg", "jpeg", "png"],
            public_id: `${Date.now()}-${file.originalname}`,
        };
    },
});

// File filter for multer using mime-types
const fileFilter = (req, file, cb) => {
    // Get extension from originalname
    const ext = file.originalname ? `.${file.originalname.split('.').pop().toLowerCase()}` : '';
    // Get mime type from extension using mime-types
    const detectedMime = mime.lookup(ext);
    const mimeTypeValid = allowedMimeTypes.includes(file.mimetype) && allowedMimeTypes.includes(detectedMime);
    const extValid = allowedExtensions.includes(ext);
    if (mimeTypeValid && extValid) {
        cb(null, true);
    } else {
        cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
};

const upload = multer({ storage, fileFilter });

export default upload;
