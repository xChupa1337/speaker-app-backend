import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { HttpError } from "../utils/error-type";
import { User } from "../models/user.model";
import { JWT_SECRET } from "../config/env";
import { sendEmail } from "../utils/send-email";

import { PremiumEmail } from "../models/premium-email.model";

export const checkEmail: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      next(new HttpError("Enter correct email", 400));
      return;
    }
    
    const user = await User.findOne({ email });
    if (user) {
      res.status(200).json({ success: true, data: { isVerified: user.isVerified, isUserExist: true } });
      return;
    }
    res.status(200).json({ success: true, data: { isVerified: false, isUserExist: false } });
  } catch (e) {
    next(e);
  }
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("\n\n--- INCOMING SIGNUP REQUEST ---");
    console.log("Body received:", req.body);
    
    const { email, password, name } = req.body || {};
    if (!email || !password || !name || !name.trim()) {
      console.log("Validation failed: missing fields");
      return next(new HttpError("Enter correct data", 400));
    }
    if (password.length < 6) {
      console.log("Validation failed: weak password");
      return next(new HttpError("Enter stronger password", 400));
    }
    
    console.log("Looking for existing user...");
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      console.log("User already exists and is verified");
      return next(new HttpError("User already exists and is verified", 400));
    }
    
    const hashPassword = await bcrypt.hash(password, 8);
    const userCode = Math.floor(1000 + Math.random() * 9000);
    
    // Check if user pre-paid
    const isPremium = await PremiumEmail.findOne({ email });
    const subscription = isPremium ? "premium" : "standard";

    if (user) {
      user.password = hashPassword;
      user.name = name;
      user.code = userCode;
      user.subscription = subscription;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        password: hashPassword,
        code: userCode,
        subscription,
      });
    }
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    
    console.log(`\n\n🎯 [DEV MODE] Registration Code for ${user.email} is: ${userCode}\n\n`);
    
    try {
      await sendEmail({
        to: user.email,
        type: "Registration Code",
        userName: user.name,
        code: userCode,
      });
    } catch (emailError) {
      console.log(`⚠️ Email failed to send (Check .env configuration). But registration succeeded.`);
    }

    res.status(200).json({ success: true, data: { token, user } });
  } catch (e) {
    next(e);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return next(new HttpError("Enter correct data", 400));
    }
    if (password.length < 6) {
      return next(new HttpError("Enter stronger password", 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return next(new HttpError("Something went wrong", 400));
    }
    const verifyPassword = await bcrypt.compare(password, user.password);
    if (!verifyPassword) {
      return next(new HttpError("Something went wrong", 400));
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    console.log(`User ${user.email} logged in with subscription: ${user.subscription}`);
    res.status(200).json({ success: true, data: { token, user } });
  } catch (e) {
    next(e);
  }
};

export const verifyEmail: RequestHandler = async (req, res, next) => {
  try {
    const { code } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!code) {
      next(new HttpError("Enter code", 400));
      return;
    }
    
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
    
    if (user.code !== code) {
      next(new HttpError("Invalid code", 400));
      return;
    }
    
    user.isVerified = true;
    await user.save();
    
    res.status(200).json({ success: true, data: { user } });
  } catch (e) {
    next(new HttpError("Invalid or expired token", 401));
  }
};

import axios from "axios";

export const googleSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return next(new HttpError("No access token provided", 400));
    }

    const { data: profile } = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!profile || !profile.email) {
      return next(new HttpError("Failed to fetch Google profile", 400));
    }

    let user = await User.findOne({ email: profile.email });
    if (!user) {
      const hashPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 8);
      
      const isPremium = await PremiumEmail.findOne({ email: profile.email });
      const subscription = isPremium ? "premium" : "standard";

      user = await User.create({
        email: profile.email,
        name: profile.name || profile.given_name || "User",
        password: hashPassword,
        isVerified: true,
        subscription,
      });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ success: true, data: { token, user } });
  } catch (e) {
    next(new HttpError("Google Auth Failed", 400));
  }
};
