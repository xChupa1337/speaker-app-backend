/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Де шукати тести
  testMatch: ["**/__tests__/**/*.test.ts"],

  // Coverage налаштування
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/__tests__/**",
    "!src/config/**",
    "!src/utils/email-template.ts",
  ],
  coverageReporters: ["text", "text-summary", "html", "lcov", "cobertura", "json-summary"],
  coverageDirectory: "coverage",

  // Таймаут для інтеграційних тестів (mongodb-memory-server потребує більше часу)
  testTimeout: 30000,

  // Очистити моки між тестами
  clearMocks: true,
  restoreMocks: true,
};
