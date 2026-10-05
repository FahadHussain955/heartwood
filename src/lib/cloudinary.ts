import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** Uploads an image buffer and returns the URL to store in the database. */
export function uploadImage(buffer: Buffer, folder = "products") {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: "image" }, (err, res) => {
        if (err || !res) return reject(err ?? new Error("Upload failed"));
        resolve({ url: res.secure_url, publicId: res.public_id });
      })
      .end(buffer);
  });
}

export const deleteImage = (publicId: string) => cloudinary.uploader.destroy(publicId);
