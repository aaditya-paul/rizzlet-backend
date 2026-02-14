import { Request, Response } from "express";
import { registerUser, loginUser, unifiedAuth } from "../services/auth.service.js";
import { HTTP_STATUS } from "../config/constants.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Email and password are required",
      });
      return;
    }

    const { user, token } = await registerUser(email, password);

    res.status(HTTP_STATUS.CREATED).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    });
  } catch (error: any) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: error.message || "Registration failed",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Email and password are required",
      });
      return;
    }

    const { user, token } = await loginUser(email, password);

    res.status(HTTP_STATUS.OK).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    });
  } catch (error: any) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: error.message || "Login failed",
    });
  }
};

export const authenticate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Email and password are required",
      });
      return;
    }

    const { user, token, isNewUser } = await unifiedAuth(email, password);

    res.status(HTTP_STATUS.OK).json({
      message: isNewUser ? "Account created successfully" : "Login successful",
      user: {
        id: user.id,
        email: user.email,
      },
      token,
      isNewUser,
    });
  } catch (error: any) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: error.message || "Authentication failed",
    });
  }
};

export default {
  register,
  login,
  authenticate,
};
