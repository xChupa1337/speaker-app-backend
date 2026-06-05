import nodemailer from "nodemailer";
import { EMAIL_ADDRESS_SENDER, EMAIL_PASSWORD } from "./env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_ADDRESS_SENDER,
    pass: EMAIL_PASSWORD,
  },
});

export default transporter;
