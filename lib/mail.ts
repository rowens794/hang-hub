import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(
  email: string,
  name: string,
  token: string
) {
  const verificationLink = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/verify?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "HangHub <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to HangHub! Please verify your email",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #8b5cf6;">Welcome to HangHub, ${name}!</h1>
          <p style="font-size: 16px; color: #4b5563;">We're so excited to have you join our community of parents making hanging out easier for their kids.</p>
          
          <div style="margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 14px; color: #8b5cf6; word-break: break-all;">${verificationLink}</p>

          <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold; color: #111827;">What's next?</p>
            <ul style="color: #4b5563; margin-top: 10px;">
              <li>Verify your email</li>
              <li>Create child profiles</li>
              <li>Setup 4-6 digit PINs</li>
            </ul>
          </div>
          <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">If you didn't sign up for HangHub, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { error };
    }

    return { data };
  } catch (err) {
    console.error("Failed to send welcome email:", err);
    return { error: err };
  }
}
