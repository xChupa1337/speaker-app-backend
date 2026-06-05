import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/error-type";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import mongoose from "mongoose";

const Topic = require("../models/topic.model");
const Question = require("../models/question.model");
const Video = require("../models/video.model");
const Text = require("../models/text.model");
const Audio = require("../models/audio.model");

export const getLessonById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new HttpError("Unauthorized", 401));
    }
    jwt.verify(authHeader.split(" ")[1], JWT_SECRET);

    // Fallback dummy response if id is invalid or "test"
    const dummyResponse = {
      success: true,
      data: [{
        lessonData: [
          {
            title: "Test Lesson",
            isQuestion: true,
            correctText: "Great job!",
            wrongText: "Try again!",
            lessonData: [
              {
                type: "sentence",
                textData: "This is a placeholder lesson because the topic was not found or you pressed the Test Card.",
                variants: [{ question: "Got it!", correct: true }]
              }
            ]
          }
        ]
      }]
    };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(200).json(dummyResponse);
      return;
    }

    const topic = await Topic.findById(id).lean();
    if (!topic) {
      res.status(200).json(dummyResponse);
      return;
    }

    const questionIds = (topic.questions || []).map((q: any) => q.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    const formattedLessonData = await Promise.all(questions.map(async (q: any) => {
      const components = [];
      
      let promptText = q.prompt;

      if (q.mediaRef && q.mediaRef.kind && q.mediaRef.id) {
        if (q.mediaRef.kind === "video") {
          const mediaDoc = await Video.findById(q.mediaRef.id).lean();
          if (mediaDoc && mediaDoc.url) {
            components.push({ type: "video", videoUri: mediaDoc.url });
          }
        } else if (q.mediaRef.kind === "text") {
          const mediaDoc = await Text.findById(q.mediaRef.id).lean();
          if (mediaDoc && mediaDoc.content) {
            promptText += `\n\n"${mediaDoc.content}"`;
          }
        } else if (q.mediaRef.kind === "audio") {
          const mediaDoc = await Audio.findById(q.mediaRef.id).lean();
          // Frontend lacks audio player for now, so we show the transcript if they are supposed to listen
          if (mediaDoc && mediaDoc.transcript) {
            promptText += `\n\n🔊 [Audio Transcript]: "${mediaDoc.transcript}"`;
          }
        }
      }

      let optionsArray = q.options || [];
      if (optionsArray.length === 0 && q.correctAnswer) {
        // Generate fake options for questions that expect typing but frontend only has buttons
        const ans = String(q.correctAnswer);
        optionsArray = [
          ans,
          ans.split(" ").reverse().join(" "),
          "I don't know.",
          "Can you repeat?"
        ].sort(() => Math.random() - 0.5);
      }

      const variants = optionsArray.map((opt: string) => ({
        question: opt,
        correct: String(opt) === String(q.correctAnswer)
      }));

      if (variants.length === 0) {
        variants.push({ question: "Continue", correct: true });
      }

      components.push({
        type: "sentence",
        textData: promptText,
        variants
      });

      return {
        title: topic.title,
        isQuestion: true,
        correctText: q.explanation || "Correct! Good job.",
        wrongText: q.explanation || "Oops, that's not quite right.",
        lessonData: components
      };
    }));

    if (formattedLessonData.length === 0) {
       formattedLessonData.push({
         title: topic.title,
         isQuestion: false,
         correctText: "Ok",
         wrongText: "Ok",
         lessonData: [{ type: "sentence", textData: "There are no questions here yet.", variants: [{question: "Continue", correct: true}] }]
       });
    }

    res.status(200).json({
      success: true,
      data: [{ lessonData: formattedLessonData }]
    });

  } catch (e) {
    next(new HttpError("Server error", 500));
  }
};
