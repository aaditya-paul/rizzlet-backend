import { Router } from "express";
import { register, login, authenticate } from "../controllers/auth.controller.js";

const router = Router();

/**
 * @route   POST /api/auth
 * @desc    Unified auth - login if user exists, register if not
 * @access  Public
 */
router.post("/", authenticate);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", login);

export default router;
