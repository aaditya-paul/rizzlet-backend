import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AuthTokenPayload } from "../models/types";
import { HTTP_STATUS } from "../config/constants";

export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: "No token provided",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
    req.user = decoded;

    next();
  } catch (error) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: "Invalid or expired token",
    });
  }
};
