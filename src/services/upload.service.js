import cloudinary from "../config/cloudinary.js";

export async function uploadAsset(file, folder = "listingjet", resourceType = "image") {
  if (!file) return null;
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return { url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`, publicId: "local-preview" };
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (error, result) => {
      if (error) reject(error);
      else resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(file.buffer);
  });
}

export function uploadImage(file, folder = "listingjet") {
  return uploadAsset(file, folder, "image");
}

export function uploadVideo(file, folder = "listingjet") {
  return uploadAsset(file, folder, "video");
}
