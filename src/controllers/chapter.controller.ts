import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/error-type";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

const Chapter = require("../models/chapter.model");
const Topic = require("../models/topic.model");

export const getChapters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new HttpError("Unauthorized", 401));
    }
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as any;
    
    // Import User directly here to avoid circular dependencies if any, or just require it
    const { User } = require("../models/user.model");
    const user = await User.findById(decoded.userId).lean();
    const completedTopicIds = (user?.progress || []).map((p: any) => p.topicId?.toString());
    
    const lang = req.query.lang || "en";
    const chapters = await Chapter.find({ languageId: lang }).sort({ order: 1 }).lean();
    const chapterIds = chapters.map((c: any) => c._id);
    const topics = await Topic.find({ chapterId: { $in: chapterIds } }).sort({ order: 1 }).lean();
    
    const data = chapters.map((chapter: any) => {
      const chapterTopics = topics.filter((t: any) => t.chapterId.toString() === chapter._id.toString());
      return {
        ...chapter,
        topics: chapterTopics.map((t: any) => ({
          ...t,
          isCompleted: completedTopicIds.includes(t._id.toString())
        }))
      };
    });
    
    res.status(200).json({
      success: true,
      data,
      pagination: { total: chapters.length, page: 1, pages: 1 }
    });
  } catch (e) {
    next(new HttpError("Invalid or expired token", 401));
  }
};
