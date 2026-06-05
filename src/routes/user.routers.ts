import { Router } from "express";
import { getUser, saveProgress } from "../controllers/user.controller";

const router = Router();
router.get("/", getUser);
router.post("/progress", saveProgress);

export default router;
