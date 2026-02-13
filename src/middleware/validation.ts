import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { HTTP_STATUS } from "../config/constants.js";

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Invalid request data",
        details: error.errors || error.message,
      });
    }
  };
};
