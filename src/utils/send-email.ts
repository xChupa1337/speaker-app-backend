import { emailTemplates } from "./email-template";
import transporter from "../config/node-mailer";
import { EMAIL_ADDRESS_SENDER } from "../config/env";
import nodemailer from "nodemailer";

export const sendEmail = async ({
  to,
  type,
  userName,
  code,
}: {
  to: string;
  type: string;
  userName: string;
  code: number;
}) => {
  if (!to || !type || !userName || !code) {
    throw new Error(
      "Missing required parameter: to, type, userName, and code are all required",
    );
  }

  const template = emailTemplates.find((t) => t.label === type);
  if (!template) {
    throw new Error("Invalid email type");
  }

  const subject = template.generateSubject();
  const html = template.generateBody({ userName, code });

  let activeTransporter = transporter;
  let isTestAccount = false;

  // Якщо пошта не налаштована правильно (наприклад, вписали логін бази даних), використовуємо Ethereal для тестування
  if (!EMAIL_ADDRESS_SENDER || !EMAIL_ADDRESS_SENDER.includes("@")) {
    const testAccount = await nodemailer.createTestAccount();
    activeTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    isTestAccount = true;
  }

  const mailOptions = {
    from: isTestAccount ? '"Speaker App Test" <test@speaker.app>' : EMAIL_ADDRESS_SENDER,
    to,
    subject,
    html,
  };

  try {
    const info = await activeTransporter.sendMail(mailOptions);
    if (isTestAccount) {
      console.log(`\n\n📫 [УВАГА!] Лист успішно відправлено на тестовий сервер!`);
      console.log(`Щоб прочитати лист і побачити код підтвердження, перейдіть за цим посиланням:`);
      console.log(`➡️  ${nodemailer.getTestMessageUrl(info)}\n\n`);
    }
  } catch (e) {
    throw e;
  }
};
