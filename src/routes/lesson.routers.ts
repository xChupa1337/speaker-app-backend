import { Router } from "express";
import { getLessonById } from "../controllers/lesson.controller";

const router = Router();
router.get("/:id", getLessonById);

export default router;
