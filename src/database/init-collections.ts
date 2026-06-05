import connectToDataBase from "./mongodb";

// Імпортуємо всі наші моделі
import { User } from "../models/user.model";
const Chapter = require("../models/chapter.model");
const Topic = require("../models/topic.model");
const Question = require("../models/question.model");
const Audio = require("../models/audio.model");
const Video = require("../models/video.model");
const Text = require("../models/text.model");

async function initCollections() {
  try {
    console.log("⏳ Підключення до бази даних...");
    await connectToDataBase();

    console.log("⏳ Створення колекцій (таблиць) та індексів...");

    // Масив усіх моделей
    const models = [User, Chapter, Topic, Question, Audio, Video, Text];

    for (const model of models) {
      if (model && model.createCollection) {
        // Примусово створюємо колекцію
        await model.createCollection();
        // Синхронізуємо індекси (наприклад, unique: true для email у User)
        await model.syncIndexes();
        console.log(`✅ Колекція (таблиця) створена/перевірена: ${model.modelName}`);
      }
    }

    console.log("🎉 Всі колекції успішно ініціалізовано!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Помилка під час ініціалізації колекцій:", error);
    process.exit(1);
  }
}

initCollections();
