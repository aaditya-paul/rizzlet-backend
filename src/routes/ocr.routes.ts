import { Router } from "express";
import multer from "multer";
import { processImage } from "../controllers/ocr.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Configure multer for image uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/**
 * @route   POST /api/ocr/extract
 * @desc    Extract text from screenshot
 * @access  Private
 */
router.post(
  "/extract",
  authMiddleware,
  aiLimiter,
  upload.single("image"),
  processImage,
);

export default router;
