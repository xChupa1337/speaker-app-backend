import { HttpError } from "../../utils/error-type";

// ── Юніт-тести для класу HttpError ────────────────────────────────────────
// Тестуємо що клас HttpError правильно встановлює всі поля
// Ці тести не потребують MongoDB або Express — чиста бізнес-логіка

describe("HttpError", () => {
  describe("constructor", () => {
    it("повинен встановити message коректно", () => {
      const error = new HttpError("Not found", 404);
      expect(error.message).toBe("Not found");
    });

    it("повинен встановити statusCode коректно", () => {
      const error = new HttpError("Bad request", 400);
      expect(error.statusCode).toBe(400);
    });

    it("повинен встановити name як 'HttpError'", () => {
      const error = new HttpError("Internal error", 500);
      expect(error.name).toBe("HttpError");
    });

    it("повинен бути instanceof Error", () => {
      const error = new HttpError("Forbidden", 403);
      expect(error).toBeInstanceOf(Error);
    });

    it("повинен бути instanceof HttpError", () => {
      const error = new HttpError("Unauthorized", 401);
      expect(error).toBeInstanceOf(HttpError);
    });
  });

  describe("різні HTTP статус коди", () => {
    const testCases = [
      { message: "Bad Request", code: 400 },
      { message: "Not Found", code: 404 },
      { message: "Internal Server Error", code: 500 },
      { message: "Conflict", code: 409 },
    ];

    testCases.forEach(({ message, code }) => {
      it(`повинен зберігати статус ${code}`, () => {
        const error = new HttpError(message, code);
        expect(error.statusCode).toBe(code);
        expect(error.message).toBe(message);
      });
    });
  });
});
