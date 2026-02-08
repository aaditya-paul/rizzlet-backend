import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/database";
import { config } from "../config";
import { User, AuthTokenPayload } from "../models/types";
import { AppError } from "../middleware/errorHandler";
import { HTTP_STATUS } from "../config/constants";

const SALT_ROUNDS = 10;

/**
 * Register a new user
 */
export const registerUser = async (
  email: string,
  password: string,
): Promise<{ user: User; token: string }> => {
  try {
    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      throw new AppError("User already exists", HTTP_STATUS.BAD_REQUEST);
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at, updated_at",
      [email, password_hash],
    );

    const user = result.rows[0];

    // Generate JWT
    const token = generateToken(user.id, user.email);

    return { user, token };
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "Registration failed",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Login user
 */
export const loginUser = async (
  email: string,
  password: string,
): Promise<{ user: User; token: string }> => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      throw new AppError("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw new AppError("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    return { user, token };
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError("Login failed", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Generate JWT token
 */
const generateToken = (userId: string, email: string): string => {
  const payload: AuthTokenPayload = {
    userId,
    email,
  };

  const options: jwt.SignOptions = {
    expiresIn: config.jwt.expiresIn as any,
  };

  return jwt.sign(payload, config.jwt.secret as jwt.Secret, options);
};

export default {
  registerUser,
  loginUser,
};
