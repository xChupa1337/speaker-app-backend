import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app, server } from "../../app";
import { User } from "../../models/user.model";

// ── Інтеграційні тести для auth маршрутів ─────────────────────────────────
// Використовуємо mongodb-memory-server — реальний MongoDB в пам'яті
// Не потребує зовнішнього MongoDB сервера (ідеально для CI/CD)

// Мокуємо відправку email щоб pipeline не потребував SMTP сервера
jest.mock("../../utils/send-email", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

let mongoServer: MongoMemoryServer;

// Запускається ОДИН РАЗ перед усіма тестами у цьому файлі
beforeAll(async () => {
  // Відключаємось від реального MongoDB якщо підключено
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Запускаємо MongoDB в пам'яті
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

// Запускається ОДИН РАЗ після всіх тестів — прибираємо за собою
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  server.close();
});

// Очищаємо колекцію users між тестами щоб тести не залежали один від одного
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ── Health Check ──────────────────────────────────────────────────────────
describe("GET /health", () => {
  it("повинен повернути статус 200 і { status: 'ok' }", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.service).toBe("speaker-app-backend");
  });
});

// ── POST /api/v1/auth/sign-up ─────────────────────────────────────────────
describe("POST /api/v1/auth/sign-up", () => {
  const validUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  it("повинен успішно зареєструвати нового користувача і повернути токен", async () => {
    const response = await request(app)
      .post("/api/v1/auth/sign-up")
      .send(validUser);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user.email).toBe(validUser.email);
    // Перевіряємо що пароль НЕ повертається у відповіді
    expect(response.body.data.user.password).toBeUndefined();
  });

  it("повинен повернути 400 якщо email відсутній", async () => {
    const response = await request(app).post("/api/v1/auth/sign-up").send({
      name: "Test User",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).not.toBe(true);
  });

  it("повинен повернути 400 якщо пароль менше 6 символів", async () => {
    const response = await request(app).post("/api/v1/auth/sign-up").send({
      name: "Test User",
      email: "test@example.com",
      password: "123",
    });

    expect(response.status).toBe(400);
  });

  it("повинен повернути 400 якщо email вже існує та підтверджений", async () => {
    // Реєструємо користувача перший раз
    await request(app).post("/api/v1/auth/sign-up").send(validUser);

    // Робимо його підтвердженим, інакше бекенд дозволить оновити непідтвердженого
    await User.updateOne({ email: validUser.email }, { isVerified: true });

    // Спроба зареєструватись з тим самим email
    const response = await request(app)
      .post("/api/v1/auth/sign-up")
      .send(validUser);

    expect(response.status).toBe(400);
  });
});

// ── POST /api/v1/auth/sign-in ─────────────────────────────────────────────
describe("POST /api/v1/auth/sign-in", () => {
  const userData = {
    name: "Test User",
    email: "signin@example.com",
    password: "password123",
  };

  // Реєструємо користувача перед тестами входу
  beforeEach(async () => {
    await request(app).post("/api/v1/auth/sign-up").send(userData);
  });

  it("повинен успішно увійти з правильними credentials", async () => {
    const response = await request(app).post("/api/v1/auth/sign-in").send({
      email: userData.email,
      password: userData.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  it("повинен повернути 400 для неіснуючого email", async () => {
    const response = await request(app).post("/api/v1/auth/sign-in").send({
      email: "nonexistent@example.com",
      password: "password123",
    });

    expect(response.status).toBe(400);
  });

  it("повинен повернути 400 для неправильного пароля", async () => {
    const response = await request(app).post("/api/v1/auth/sign-in").send({
      email: userData.email,
      password: "wrongpassword",
    });

    expect(response.status).toBe(400);
  });

  it("повинен повернути 400 якщо email відсутній", async () => {
    const response = await request(app).post("/api/v1/auth/sign-in").send({
      password: "password123",
    });

    expect(response.status).toBe(400);
  });
});
