import { Router } from "express";
import { generateReply } from "../controllers/reply.controller";
import { authMiddleware } from "../middleware/auth";
import { aiLimiter } from "../middleware/rateLimiter";

const router = Router();

/**
 * @route   POST /api/replies/generate
 * @desc    Generate reply suggestions
 * @access  Private
 */
router.post("/generate", authMiddleware, aiLimiter, generateReply);

export default router;
