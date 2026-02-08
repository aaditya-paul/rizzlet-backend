import { Router } from "express";
import { getUsageStats } from "../controllers/usage.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

/**
 * @route   GET /api/usage/stats
 * @desc    Get user usage statistics
 * @access  Private
 */
router.get("/stats", authMiddleware, getUsageStats);

export default router;
