import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Project photos are stored at most 1600px. Gallery photos also get the logo (Cloudinary id "watermark/afzal-logo-home",
// the home page logo, public/logo.svg rendered to PNG) burned in, centred and faint.
const projectSize = { width: 1600, height: 1600, crop: "limit" };
const logoWatermark = { overlay: "watermark:afzal-logo-home", width: 0.4, flags: "relative", opacity: 30, gravity: "center" };

/** Uploads an image buffer and returns the URL to store in the database. */
export function uploadImage(buffer: Buffer, folder = "products", { watermark = false } = {}) {
  const projectPhoto = folder.startsWith("projects");
  const options = projectPhoto ? { format: "jpg", transformation: watermark ? [projectSize, logoWatermark] : [projectSize] } : {};
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: "image", ...options }, (err, res) => {
        if (err || !res) return reject(err ?? new Error("Upload failed"));
        resolve({ url: res.secure_url, publicId: res.public_id });
      })
      .end(buffer);
  });
}

export const deleteImage = (publicId: string) => cloudinary.uploader.destroy(publicId);
