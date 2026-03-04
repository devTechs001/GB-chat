// server/middleware/upload.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allowed image types for avatar uploads
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",      // .jpg, .jpeg
  "image/png",       // .png
  "image/gif",       // .gif
  "image/webp",      // .webp
  "image/svg+xml",   // .svg
  "image/bmp",       // .bmp
];

// Memory storage for most uploads
const memoryStorage = multer.memoryStorage();

// Disk storage for avatar uploads (needed for cloudinary)
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const userId = req.user?._id || 'unknown';
    cb(null, 'avatar-' + userId + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Image file filter - only allows image types
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const ext = path.extname(file.originalname).toLowerCase();
    const supportedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];

    if (supportedExts.includes(ext)) {
      // File extension is okay but MIME type might be wrong
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Supported formats: JPG, PNG, GIF, WEBP, SVG, BMP`), false);
    }
  }
};

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    ...ALLOWED_IMAGE_TYPES,
    "video/mp4",
    "video/webm",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/webm",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "text/plain",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

// Memory upload for general use
export const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 64 * 1024 * 1024 }, // 64MB
});

// Disk upload specifically for avatars with image-only filter
export const uploadAvatarDisk = multer({
  storage: diskStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for avatars
    files: 1, // Only allow single file
  },
});