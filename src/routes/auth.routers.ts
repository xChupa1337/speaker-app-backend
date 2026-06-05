import { Router } from "express";
import { signIn, signUp, checkEmail, verifyEmail, googleSignIn } from "../controllers/auth.controller";

const authRouter = Router();

// PATH: api/v1/auth/check-email [POST]
authRouter.post("/check-email", checkEmail);

// PATH: api/v1/auth/sign-in [POST]
authRouter.post("/sign-in", signIn);

// PATH: api/v1/auth/sign-up [POST]
authRouter.post("/sign-up", signUp);

// PATH: api/v1/auth/verify [POST]
authRouter.post("/verify", verifyEmail);

// PATH: api/v1/auth/google [POST]
authRouter.post("/google", googleSignIn);

export default authRouter;
