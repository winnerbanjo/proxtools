import { BrevoClient } from "@getbrevo/brevo";

/**
 * Checks if the required environment variables are set.
 */
export function isBrevoConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_FROM_EMAIL);
}

/**
 * Sends a transactional email using the latest Brevo SDK (v6+).
 */
export async function sendMail(input: { to: string; subject: string; html: string; text?: string }) {
  if (!isBrevoConfigured()) {
    console.warn("Brevo is not configured. Email skipped:", input.subject);
    return { skipped: true };
  }

  // 1. Initialize the unified client
  const apiInstance = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY!,
  });

  try {
    // 2. Call the transactional email method with a plain object
    // No more 'new Brevo.SendSmtpEmail()' required.
    const result = await apiInstance.transactionalEmails.sendTransacEmail({
      subject: input.subject,
      htmlContent: input.html,
      textContent: input.text,
      sender: {
        email: process.env.BREVO_FROM_EMAIL!,
        name: process.env.BREVO_FROM_NAME || "ProxTools",
      },
      to: [
        {
          email: input.to,
        },
      ],
    });

    return result;
  } catch (error) {
    console.error("Brevo sending failed:", error);
    throw error;
  }
}