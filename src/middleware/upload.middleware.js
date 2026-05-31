import multer from "multer";
import { HttpError } from "../utils/httpError.js";

const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const allowedVideos = ["video/mp4", "video/webm", "video/quicktime"];
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 80 * 1024 * 1024, files: 13 },
  fileFilter: (_req, file, cb) => {
    const validImage = file.fieldname === "images" && allowedImages.includes(file.mimetype);
    const validVideo = file.fieldname === "video" && allowedVideos.includes(file.mimetype);
    if (!validImage && !validVideo) return cb(new HttpError(400, "Only image files and MP4/WebM/MOV videos are allowed"));
    cb(null, true);
  }
});

export const listingUpload = upload.fields([
  { name: "images", maxCount: 12 },
  { name: "video", maxCount: 1 }
]);
