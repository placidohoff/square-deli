// Cloudinary stores uploaded images and hands back a permanent https URL —
// that URL is what we save as a MenuItem's imageUrl, so the frontend never
// needs to know images live outside this app.
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer (see index.js) gives us the uploaded file as an in-memory Buffer,
// not a file path — Cloudinary's Node SDK wants a stream for buffer uploads,
// so this wraps upload_stream in a Promise to `await` like a normal upload.
export function uploadImage(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'square-deli-menu' },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
