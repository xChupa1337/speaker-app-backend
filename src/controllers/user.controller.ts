import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/error-type";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { User } from "../models/user.model";

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next(new HttpError("Unauthorized", 401));
      return;
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      next(new HttpError("User not found", 404));
      return;
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (e) {
    next(new HttpError("Invalid or expired token", 401));
  }
};

export const saveProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next(new HttpError("Unauthorized", 401));
      return;
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      next(new HttpError("User not found", 404));
      return;
    }

    const { topicId } = req.body;
    if (!topicId) {
      res.status(400).json({ success: false, message: "topicId is required" });
      return;
    }

    const alreadyCompleted = user.progress.some((p: any) => p.topicId?.toString() === topicId);
    if (!alreadyCompleted) {
      user.progress.push({ topicId, completedAt: new Date() });
      await user.save();
    }

    res.status(200).json({ success: true, data: user.progress });
  } catch (e) {
    next(new HttpError("Invalid or expired token", 401));
  }
};
