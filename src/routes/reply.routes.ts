import { Router } from "express";
import { generateReply } from "../controllers/reply.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = Router();

/**
 * @route   POST /api/replies/generate
 * @desc    Generate reply suggestions
 * @access  Private
 */
router.post("/generate", authMiddleware, aiLimiter, generateReply);

export default router;
