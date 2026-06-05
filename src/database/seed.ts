import mongoose from "mongoose";
import connectToDataBase from "./mongodb";

const Chapter = require("../models/chapter.model");
const Topic = require("../models/topic.model");
const Question = require("../models/question.model");
const Text = require("../models/text.model");
const Audio = require("../models/audio.model");
const Video = require("../models/video.model");

const languages = ["en", "es", "fr", "de", "pl", "uk"];
const TOTAL_CHAPTERS = 54;

const chapterTitles = [
  "Greetings & Basics", "Personal Information", "Everyday Objects", "Numbers & Time", "Colors & Shapes",
  "Family & Friends", "Food & Drinks", "Hobbies & Interests", "Daily Routine", "In the City",
  "Travel & Directions", "At the Restaurant", "Shopping & Clothes", "Health & Body", "Weather & Seasons",
  "Work & Jobs", "Education & School", "Home & Furniture", "Animals & Nature", "Technology & Gadgets",
  "Emotions & Feelings", "Holidays & Celebrations", "Sports & Fitness", "Arts & Entertainment", "News & Media",
  "Science & Space", "History & Culture", "Politics & Society", "Environment & Ecology", "Business & Economy",
  "Relationships", "Mental Health", "Law & Crime", "Philosophy & Ethics", "Literature & Writing",
  "Music & Instruments", "Cinema & Movies", "Fashion & Trends", "Cooking & Recipes", "Transportation",
  "Geography & Places", "Inventions", "Myths & Legends", "Future Predictions", "Social Media",
  "Volunteering", "Investing & Money", "Psychology", "Languages & Dialects", "Architecture",
  "Survival Skills", "Pop Culture", "Space Exploration", "Deep Tech"
];

const topicTemplates = [
  ["Vocabulary building", "Grammar basics", "Common phrases"],
  ["Listening practice", "Reading comprehension", "Speaking drills"],
  ["Real-life scenarios", "Roleplay", "Writing exercises"],
  ["Advanced words", "Idioms", "Pronunciation"],
  ["Discussion points", "Debate topics", "Essay writing"]
];

const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

const generateSentence = (lang: string, chapterIdx: number, topicIdx: number, questionIdx: number) => {
  const subjects = {
    en: ["I", "You", "He", "She", "We", "They", "The student", "The doctor", "My friend", "The teacher"],
    es: ["Yo", "Tú", "Él", "Ella", "Nosotros", "Ellos", "El estudiante", "El médico", "Mi amigo", "El profesor"],
    fr: ["Je", "Tu", "Il", "Elle", "Nous", "Ils", "L'étudiant", "Le médecin", "Mon ami", "Le professeur"],
    de: ["Ich", "Du", "Er", "Sie", "Wir", "Sie", "Der Student", "Der Arzt", "Mein Freund", "Der Lehrer"],
    pl: ["Ja", "Ty", "On", "Ona", "My", "Oni", "Student", "Lekarz", "Mój przyjaciel", "Nauczyciel"],
    uk: ["Я", "Ти", "Він", "Вона", "Ми", "Вони", "Студент", "Лікар", "Мій друг", "Вчитель"]
  };

  const verbs = {
    en: ["see", "have", "want", "like", "need", "know", "find", "take", "make", "think"],
    es: ["veo", "tengo", "quiero", "gusta", "necesito", "conozco", "encuentro", "tomo", "hago", "pienso"],
    fr: ["vois", "ai", "veux", "aime", "ai besoin de", "connais", "trouve", "prends", "fais", "pense"],
    de: ["sehe", "habe", "will", "mag", "brauche", "kenne", "finde", "nehme", "mache", "denke"],
    pl: ["widzę", "mam", "chcę", "lubię", "potrzebuję", "znam", "znajduję", "biorę", "robię", "myślę"],
    uk: ["бачу", "маю", "хочу", "люблю", "потребую", "знаю", "знаходжу", "беру", "роблю", "думаю"]
  };

  const objects = {
    en: ["a book", "the car", "some water", "an apple", "the house", "a pen", "the problem", "the answer", "a chance", "the city"],
    es: ["un libro", "el coche", "agua", "una manzana", "la casa", "un bolígrafo", "el problema", "la respuesta", "una oportunidad", "la ciudad"],
    fr: ["un livre", "la voiture", "de l'eau", "une pomme", "la maison", "un stylo", "le problème", "la réponse", "une chance", "la ville"],
    de: ["ein Buch", "das Auto", "etwas Wasser", "einen Apfel", "das Haus", "einen Stift", "das Problem", "die Antwort", "eine Chance", "die Stadt"],
    pl: ["książkę", "samochód", "wodę", "jabłko", "dom", "długopis", "problem", "odpowiedź", "szansę", "miasto"],
    uk: ["книгу", "машину", "воду", "яблуко", "будинок", "ручку", "проблему", "відповідь", "шанс", "місто"]
  };

  const sub = subjects[lang as keyof typeof subjects][(questionIdx + chapterIdx) % subjects[lang as keyof typeof subjects].length];
  const verb = verbs[lang as keyof typeof verbs][(chapterIdx + topicIdx) % verbs[lang as keyof typeof verbs].length];
  const obj = objects[lang as keyof typeof objects][(topicIdx + questionIdx) % objects[lang as keyof typeof objects].length];

  const subUk = subjects.uk[(questionIdx + chapterIdx) % subjects.uk.length];
  const verbUk = verbs.uk[(chapterIdx + topicIdx) % verbs.uk.length];
  const objUk = objects.uk[(topicIdx + questionIdx) % objects.uk.length];

  const text = `${sub} ${verb} ${obj}.`;
  const translation = `${subUk} ${verbUk} ${objUk}.`;

  return { text, translation, missing: verb, options: shuffle([...verbs[lang as keyof typeof verbs]]).slice(0, 4) };
};

const seedData = async () => {
  try {
    console.log("Connecting to the database...");
    await connectToDataBase();

    console.log("Clearing existing data...");
    await Chapter.deleteMany({});
    await Topic.deleteMany({});
    await Question.deleteMany({});
    await Text.deleteMany({});
    await Audio.deleteMany({});
    await Video.deleteMany({});

    console.log("Generating fast multi-language seed data...");

    const chaptersToInsert = [];
    const topicsToInsert = [];
    const questionsToInsert = [];
    const textsToInsert = [];
    const audiosToInsert = [];

    for (const langCode of languages) {
      console.log(`🌍 Preparing Language: ${langCode.toUpperCase()}`);

      for (let c = 1; c <= TOTAL_CHAPTERS; c++) {
        const levelPrefix = c <= 10 ? "A1" : c <= 25 ? "A2" : c <= 40 ? "B1" : "B2";
        const chapterTitle = chapterTitles[c - 1] || `Lesson ${c}`;
        const chapterId = new mongoose.Types.ObjectId();
        
        chaptersToInsert.push({
          _id: chapterId,
          title: `[${levelPrefix}] ${chapterTitle}`,
          order: c,
          iconUrl: "📚",
          languageId: langCode
        });

        const topicsArray = topicTemplates[(c - 1) % topicTemplates.length];
        
        let topicOrder = 1;
        for (let t = 0; t < topicsArray.length; t++) {
          const topicId = new mongoose.Types.ObjectId();
          const topicTitle = topicsArray[t];

          const numQuestions = 5; 
          const questionsList = [];

          for (let q = 1; q <= numQuestions; q++) {
            const sentenceData = generateSentence(langCode, c, t, q);
            const questionTypeRnd = Math.random();
            const questionId = new mongoose.Types.ObjectId();

            if (questionTypeRnd < 0.4) {
              const textId = new mongoose.Types.ObjectId();
              textsToInsert.push({ _id: textId, content: sentenceData.text });
              
              const wrongOptions = [
                generateSentence(langCode, c+1, t, q).translation,
                generateSentence(langCode, c, t+1, q).translation,
                generateSentence(langCode, c, t, q+1).translation,
              ];
              const options = shuffle([sentenceData.translation, ...wrongOptions]);

              questionsToInsert.push({
                _id: questionId,
                type: "simple",
                prompt: `Translate this to Ukrainian:`,
                options: options,
                correctAnswer: sentenceData.translation,
                explanation: `Correct translation for "${sentenceData.text}" is "${sentenceData.translation}".`,
                mediaRef: { kind: "text", id: textId },
              });
            } else if (questionTypeRnd < 0.7) {
              const maskedText = sentenceData.text.replace(sentenceData.missing, "______");
              const textId = new mongoose.Types.ObjectId();
              textsToInsert.push({ _id: textId, content: maskedText });
              
              questionsToInsert.push({
                _id: questionId,
                type: "interactive",
                prompt: `Fill in the missing word:`,
                options: sentenceData.options.includes(sentenceData.missing) ? sentenceData.options : [sentenceData.missing, ...sentenceData.options.slice(0,3)],
                correctAnswer: sentenceData.missing,
                explanation: `The full sentence is: "${sentenceData.text}".`,
                mediaRef: { kind: "text", id: textId },
              });
            } else {
              const audioId = new mongoose.Types.ObjectId();
              audiosToInsert.push({
                _id: audioId,
                url: `https://example.com/audio/${langCode}-lesson-${c}.mp3`,
                transcript: sentenceData.text,
                durationSec: 5,
              });

              questionsToInsert.push({
                _id: questionId,
                type: "validation",
                prompt: `Listen and type what you hear.`,
                correctAnswer: sentenceData.text,
                explanation: `The speaker said: "${sentenceData.text}"`,
                mediaRef: { kind: "audio", id: audioId },
              });
            }

            questionsList.push({ questionId: questionId, order: q });
          }

          topicsToInsert.push({
            _id: topicId,
            chapterId: chapterId,
            title: topicTitle,
            description: `Learn ${topicTitle.toLowerCase()}`,
            order: topicOrder++,
            questions: questionsList
          });
        }
      }
    }

    console.log("Bulk inserting data into database...");
    await Text.insertMany(textsToInsert);
    await Audio.insertMany(audiosToInsert);
    await Question.insertMany(questionsToInsert);
    await Topic.insertMany(topicsToInsert);
    await Chapter.insertMany(chaptersToInsert);

    console.log("\n✅ Massive Multi-language seed data inserted successfully in seconds!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
