import mongoose from "mongoose";
import connectToDataBase from "./mongodb";
const Chapter = require("../models/chapter.model");
const Topic = require("../models/topic.model");

const translations: any = {
  es: {
    chapters: [
      "Saludos y Conceptos Básicos", "Información Personal", "Objetos Cotidianos", "Números y Tiempo", "Colores y Formas",
      "Familia y Amigos", "Comida y Bebidas", "Pasatiempos e Intereses", "Rutina Diaria", "En la Ciudad",
      "Viajes y Direcciones", "En el Restaurante", "Compras y Ropa", "Salud y Cuerpo", "Clima y Estaciones",
      "Trabajo y Empleos", "Educación y Escuela", "Hogar y Muebles", "Animales y Naturaleza", "Tecnología y Gadgets",
      "Emociones y Sentimientos", "Vacaciones y Celebraciones", "Deportes y Fitness", "Arte y Entretenimiento", "Noticias y Medios",
      "Ciencia y Espacio", "Historia y Cultura", "Política y Sociedad", "Medio Ambiente y Ecología", "Negocios y Economía",
      "Relaciones", "Salud Mental", "Ley y Crimen", "Filosofía y Ética", "Literatura y Escritura",
      "Música e Instrumentos", "Cine y Películas", "Moda y Tendencias", "Cocina y Recetas", "Transporte",
      "Geografía y Lugares", "Inventos", "Mitos y Leyendas", "Predicciones Futuras", "Redes Sociales",
      "Voluntariado", "Inversión y Dinero", "Psicología", "Idiomas y Dialectos", "Arquitectura",
      "Habilidades de Supervivencia", "Cultura Pop", "Exploración Espacial", "Tecnología Profunda"
    ],
    topics: [
      ["Construcción de vocabulario", "Conceptos básicos de gramática", "Frases comunes"],
      ["Práctica auditiva", "Comprensión lectora", "Ejercicios orales"],
      ["Escenarios de la vida real", "Juego de roles", "Ejercicios de escritura"],
      ["Palabras avanzadas", "Modismos", "Pronunciación"],
      ["Puntos de discusión", "Temas de debate", "Redacción de ensayos"]
    ]
  },
  fr: {
    chapters: [
      "Salutations et Bases", "Informations Personnelles", "Objets du Quotidien", "Nombres et Temps", "Couleurs et Formes",
      "Famille et Amis", "Nourriture et Boissons", "Loisirs et Intérêts", "Routine Quotidienne", "Dans la Ville",
      "Voyages et Directions", "Au Restaurant", "Achats et Vêtements", "Santé et Corps", "Météo et Saisons",
      "Travail et Emplois", "Éducation et École", "Maison et Meubles", "Animaux et Nature", "Technologie et Gadgets",
      "Émotions et Sentiments", "Vacances et Célébrations", "Sports et Fitness", "Arts et Divertissement", "Actualités et Médias",
      "Science et Espace", "Histoire et Culture", "Politique et Société", "Environnement et Écologie", "Affaires et Économie",
      "Relations", "Santé Mentale", "Droit et Crime", "Philosophie et Éthique", "Littérature et Écriture",
      "Musique et Instruments", "Cinéma et Films", "Mode et Tendances", "Cuisine et Recettes", "Transport",
      "Géographie et Lieux", "Inventions", "Mythes et Légendes", "Prédictions Futures", "Réseaux Sociaux",
      "Bénévolat", "Investissement et Argent", "Psychologie", "Langues et Dialectes", "Architecture",
      "Compétences de Survie", "Culture Pop", "Exploration Spatiale", "Technologie Profonde"
    ],
    topics: [
      ["Construction de vocabulaire", "Bases de la grammaire", "Phrases courantes"],
      ["Pratique de l'écoute", "Compréhension de lecture", "Exercices d'expression orale"],
      ["Scénarios réels", "Jeux de rôle", "Exercices d'écriture"],
      ["Mots avancés", "Idiomes", "Prononciation"],
      ["Points de discussion", "Sujets de débat", "Rédaction d'essais"]
    ]
  },
  de: {
    chapters: [
      "Grüße & Grundlagen", "Persönliche Daten", "Alltagsgegenstände", "Zahlen & Zeit", "Farben & Formen",
      "Familie & Freunde", "Essen & Trinken", "Hobbys & Interessen", "Tägliche Routine", "In der Stadt",
      "Reisen & Richtungen", "Im Restaurant", "Einkaufen & Kleidung", "Gesundheit & Körper", "Wetter & Jahreszeiten",
      "Arbeit & Jobs", "Bildung & Schule", "Zuhause & Möbel", "Tiere & Natur", "Technologie & Gadgets",
      "Emotionen & Gefühle", "Feiertage & Feiern", "Sport & Fitness", "Kunst & Unterhaltung", "Nachrichten & Medien",
      "Wissenschaft & Weltraum", "Geschichte & Kultur", "Politik & Gesellschaft", "Umwelt & Ökologie", "Wirtschaft & Handel",
      "Beziehungen", "Psychische Gesundheit", "Recht & Kriminalität", "Philosophie & Ethik", "Literatur & Schreiben",
      "Musik & Instrumente", "Kino & Filme", "Mode & Trends", "Kochen & Rezepte", "Verkehr",
      "Geografie & Orte", "Erfindungen", "Mythen & Legenden", "Zukunftsprognosen", "Soziale Medien",
      "Ehrenamt", "Investieren & Geld", "Psychologie", "Sprachen & Dialekte", "Architektur",
      "Überlebensfähigkeiten", "Popkultur", "Weltraumforschung", "Tiefentechnologie"
    ],
    topics: [
      ["Wortschatzaufbau", "Grammatikgrundlagen", "Häufige Phrasen"],
      ["Hörpraxis", "Leseverständnis", "Sprechübungen"],
      ["Reale Szenarien", "Rollenspiele", "Schreibübungen"],
      ["Fortgeschrittene Wörter", "Idiome", "Aussprache"],
      ["Diskussionspunkte", "Debattenthemen", "Aufsatzschreiben"]
    ]
  },
  pl: {
    chapters: [
      "Powitania i Podstawy", "Informacje Osobiste", "Przedmioty Codzienne", "Liczby i Czas", "Kolory i Kształty",
      "Rodzina i Przyjaciele", "Jedzenie i Napoje", "Hobby i Zainteresowania", "Codzienna Rutyna", "W Mieście",
      "Podróże i Kierunki", "W Restauracji", "Zakupy i Ubrania", "Zdrowie i Ciało", "Pogoda i Pory Roku",
      "Praca i Zawody", "Edukacja i Szkoła", "Dom i Meble", "Zwierzęta i Natura", "Technologia i Gadżety",
      "Emocje i Uczucia", "Święta i Uroczystości", "Sport i Fitness", "Sztuka i Rozrywka", "Wiadomości i Media",
      "Nauka i Kosmos", "Historia i Kultura", "Polityka i Społeczeństwo", "Środowisko i Ekologia", "Biznes i Gospodarka",
      "Relacje", "Zdrowie Psychiczne", "Prawo i Przestępczość", "Filozofia i Etyka", "Literatura i Pisanie",
      "Muzyka i Instrumenty", "Kino i Filmy", "Moda i Trendy", "Gotowanie i Przepisy", "Transport",
      "Geografia i Miejsca", "Wynalazki", "Mity i Legendy", "Prognozy na Przyszłość", "Media Społecznościowe",
      "Wolontariat", "Inwestowanie i Pieniądze", "Psychologia", "Języki i Dialekty", "Architektura",
      "Umiejętności Przetrwania", "Popkultura", "Eksploracja Kosmosu", "Głęboka Technologia"
    ],
    topics: [
      ["Budowanie słownictwa", "Podstawy gramatyki", "Wspólne frazy"],
      ["Praktyka słuchania", "Czytanie ze zrozumieniem", "Ćwiczenia mówienia"],
      ["Scenariusze z życia wzięte", "Odgrywanie ról", "Ćwiczenia z pisania"],
      ["Zaawansowane słowa", "Idiomy", "Wymowa"],
      ["Punkty do dyskusji", "Tematy do debaty", "Pisanie esejów"]
    ]
  }
};

const updateData = async () => {
  try {
    console.log("Connecting...");
    await connectToDataBase();

    for (const lang of Object.keys(translations)) {
      const data = translations[lang];
      console.log("Updating", lang);
      const chapters = await Chapter.find({ languageId: lang }).sort({ order: 1 });
      
      for (const chap of chapters) {
        const cIdx = chap.order - 1;
        const levelPrefix = chap.order <= 10 ? "A1" : chap.order <= 25 ? "A2" : chap.order <= 40 ? "B1" : "B2";
        chap.title = `[${levelPrefix}] ${data.chapters[cIdx] || "Lesson " + chap.order}`;
        await chap.save();

        const topics = await Topic.find({ chapterId: chap._id }).sort({ order: 1 });
        const topicsArray = data.topics[cIdx % data.topics.length];
        let tIdx = 0;
        for (const t of topics) {
          t.title = topicsArray[tIdx] || "Topic";
          t.description = `Learn ${topicsArray[tIdx]}`;
          await t.save();
          tIdx++;
        }
      }
    }
    console.log("Done!");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
};

updateData();
