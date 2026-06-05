import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/error-type";

const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let err = { ...error } as CustomError;
    err.message = error.message;

    // Mongoose bad Object id
    if (error.name === "CastError") {
      err = new Error("Resource not found") as CustomError;
      err.statusCode = 404;
    }

    // Mongoose duplicate key
    if ((error as any).code === 11000) {
      err = new Error("Duplicate field value entered") as CustomError;
      err.statusCode = 400;
    }

    // Mongoose validation error
    if (error.name === "ValidationError" && (error as any).errors) {
      const message = Object.values((error as any).errors)
        .map((val: any) => val.message)
        .join(", ");
      err = new Error(message) as CustomError;
      err.statusCode = 400;
    }

    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || "Server Error",
    });
  } catch (e) {
    next(e);
  }
};

export default errorMiddleware;
