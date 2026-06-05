import * as Brevo from "@getbrevo/brevo";

export function isBrevoConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_FROM_EMAIL);
}

export async function sendMail(input: { to: string; subject: string; html: string; text?: string }) {
  if (!isBrevoConfigured()) {
    console.warn("Brevo is not configured. Email skipped:", input.subject);
    return { skipped: true };
  }

  const client = new Brevo.TransactionalEmailsApi();
  client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

  const message = new Brevo.SendSmtpEmail();
  message.sender = {
    email: process.env.BREVO_FROM_EMAIL!,
    name: process.env.BREVO_FROM_NAME || "ProxTools",
  };
  message.to = [{ email: input.to }];
  message.subject = input.subject;
  message.htmlContent = input.html;
  message.textContent = input.text;

  return client.sendTransacEmail(message);
}
