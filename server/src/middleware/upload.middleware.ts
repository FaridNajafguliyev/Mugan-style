import multer from "multer";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Memory storage — files stay as an in-memory Buffer so upload.service.ts
// can route them to Cloudinary or local disk uniformly, without multer
// ever writing to disk itself.
export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Разрешены только изображения JPEG, PNG или WebP"));
      return;
    }
    cb(null, true);
  },
});
