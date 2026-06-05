import { config } from "dotenv";

config({ path: `.env` });

export const {
  PORT,
  NODE_ENV,
  MONGODB_URI,
  BASE_URL,
  JWT_SECRET,
  EMAIL_PASSWORD,
  EMAIL_ADDRESS_SENDER,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  CLIENT_URL,
} = process.env;
