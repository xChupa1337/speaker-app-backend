import { Router } from "express";
import { getChapters } from "../controllers/chapter.controller";

const router = Router();
router.get("/", getChapters);

export default router;
