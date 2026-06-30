import { resend } from "./resend";
import { welcomeEmailTemplate } from "../templates/welcome-email";

interface WelcomeEmailInput {
  fullName: string;
  email: string;
  temporaryPassword: string;
}

export async function sendWelcomeEmail({
  fullName,
  email,
  temporaryPassword,
}: WelcomeEmailInput) {
  console.log("========== RESEND TEST ==========");
  console.log("API KEY:", process.env.RESEND_API_KEY);
  console.log("Sending email to:", email);

  const result = await resend.emails.send({
    from: "STAFF United <no-reply@staffunitedgroup.com>",
    to: email,
    subject: "Welcome to STAFF United",
    html: welcomeEmailTemplate({
      fullName,
      email,
      temporaryPassword,
    }),
  });

  console.log("Resend Result:");
  console.log(result);

  return result;
}
