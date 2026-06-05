export const generateCodeEmailTemplate = ({
  userName,
  code,
  purpose,
}: {
  userName: string;
  code: number;
  purpose: "registration" | "password_reset";
}) => {
  const title =
    purpose === "registration" ? "Registration Confirmation" : "Password Reset";

  const actionText =
    purpose === "registration"
      ? "complete your registration"
      : "reset your password";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#E6F2FF; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #F2F2F2;">
          <tr>
            <td style="background-color:#0066FF; text-align:center; padding:20px 0;">
              <h1 style="color:#FFFFFF; margin:0; font-size:24px;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px; color:#333333; font-size:16px; line-height:1.5;">
              <p style="margin:0 0 16px;">Hello, <strong>${userName}</strong>!</p>
              <p style="margin:0 0 24px;">To <strong>${actionText}</strong></p>
              <div style="text-align:center; margin:30px 0;">
                <span style="display:inline-block; padding:16px 24px; font-size:28px; letter-spacing:4px; font-weight:bold; color:#0066FF; border:2px dashed #0066FF; border-radius:4px;">
                  ${code}
                </span>
              </div>
              <p style="margin:0 0 16px;">If you did not request this, you can safely ignore this email.</p>
              <p style="margin:32px 0 0;">Best regards,<br/>The Speaker Team</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#F8F8F8; text-align:center; padding:20px; font-size:12px; color:#666666;">
              <p style="margin:0;">&copy; ${new Date().getFullYear()} Speaker Inc. | 123 Main St, Anytown, AN 12345</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

export const emailTemplates = [
  {
    label: "Registration Code",
    generateSubject: () => "Your Speaker Registration Code",
    generateBody: (data: { userName: string; code: number }) =>
      generateCodeEmailTemplate({ ...data, purpose: "registration" }),
  },
  {
    label: "Password Reset Code",
    generateSubject: () => "Your Speaker Password Reset Code",
    generateBody: (data: { userName: string; code: number }) =>
      generateCodeEmailTemplate({ ...data, purpose: "password_reset" }),
  },
];
