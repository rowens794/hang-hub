import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // Vercel production URL (recommended for emails)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  // Vercel preview/branch URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export async function sendParentInviteEmail(parentEmail: string) {
  const signupLink = `${
    getBaseUrl()
  }/signup`;

  try {
    const { data, error } = await resend.emails.send({
      from: "HangHub <onboarding@resend.dev>",
      to: [parentEmail],
      subject: "Your kid wants to join HangHub!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #8b5cf6;">Your kid wants to join HangHub!</h1>
          <p style="font-size: 16px; color: #4b5563;">Someone entered your email address because they want to use HangHub to coordinate hangouts with their friends.</p>

          <p style="font-size: 16px; color: #4b5563;"><strong>HangHub</strong> is an app that helps kids plan sleepovers, after-school hangs, and more—with built-in parental approval so you always know what's happening.</p>

          <div style="margin: 30px 0;">
            <a href="${signupLink}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Create Parent Account</a>
          </div>

          <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold; color: #111827;">How it works:</p>
            <ol style="color: #4b5563; margin-top: 10px;">
              <li>Create your free parent account</li>
              <li>Add your child with a username & PIN</li>
              <li>Your child logs in and connects with friends</li>
              <li>You approve hang requests when they come in</li>
            </ol>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">If you didn't expect this email, you can safely ignore it.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { error };
    }

    return { data };
  } catch (err) {
    console.error("Failed to send parent invite email:", err);
    return { error: err };
  }
}

export async function sendHangApprovalEmail({
  parentEmail,
  parentName,
  childName,
  hangTitle,
  hangDate,
  approveToken,
  declineToken,
}: {
  parentEmail: string;
  parentName: string;
  childName: string;
  hangTitle: string;
  hangDate: string;
  approveToken: string;
  declineToken: string;
}) {
  const baseUrl = getBaseUrl();
  const approveLink = `${baseUrl}/approve/${approveToken}`;
  const declineLink = `${baseUrl}/approve/${declineToken}`;

  const formattedDate = new Date(hangDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  try {
    const { data, error } = await resend.emails.send({
      from: "HangHub <onboarding@resend.dev>",
      to: [parentEmail],
      subject: `${childName} wants to hang out - approval needed!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #8b5cf6;">Hang Request from ${childName}</h1>

          <p style="font-size: 16px; color: #4b5563;">Hi ${parentName},</p>

          <p style="font-size: 16px; color: #4b5563;"><strong>${childName}</strong> is asking for permission to join a hang:</p>

          <div style="margin: 24px 0; padding: 20px; background-color: #f3f4f6; border-radius: 12px; border-left: 4px solid #8b5cf6;">
            <p style="margin: 0 0 8px 0; font-size: 20px; font-weight: bold; color: #111827;">${hangTitle}</p>
            <p style="margin: 0; font-size: 16px; color: #6b7280;">${formattedDate}</p>
          </div>

          <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">Is it okay for ${childName} to attend?</p>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto;">
            <tr>
              <td style="padding-right: 8px;">
                <a href="${approveLink}" style="background-color: #22c55e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; mso-padding-alt: 0; text-align: center;">
                  <!--[if mso]><i style="mso-font-width: 200%; mso-text-raise: 30px;">&nbsp;</i><![endif]-->
                  <span style="mso-text-raise: 15px;">Yes, Approve</span>
                  <!--[if mso]><i style="mso-font-width: 200%;">&nbsp;</i><![endif]-->
                </a>
              </td>
              <td style="padding-left: 8px;">
                <a href="${declineLink}" style="background-color: #ef4444; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; mso-padding-alt: 0; text-align: center;">
                  <!--[if mso]><i style="mso-font-width: 200%; mso-text-raise: 30px;">&nbsp;</i><![endif]-->
                  <span style="mso-text-raise: 15px;">No, Decline</span>
                  <!--[if mso]><i style="mso-font-width: 200%;">&nbsp;</i><![endif]-->
                </a>
              </td>
            </tr>
          </table>

          <p style="margin-top: 30px; font-size: 14px; color: #9ca3af; text-align: center;">You can also manage this request from your <a href="${baseUrl}/parent/dashboard" style="color: #8b5cf6;">Parent Dashboard</a>.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { error };
    }

    return { data };
  } catch (err) {
    console.error("Failed to send hang approval email:", err);
    return { error: err };
  }
}

export async function sendQRInviteEmail({
  parentEmail,
  inviteeName,
  inviterName,
  hangTitle,
  hangDate,
  approvalToken,
  inviteToken,
}: {
  parentEmail: string;
  inviteeName: string;
  inviterName: string;
  hangTitle?: string;
  hangDate?: string;
  approvalToken: string;
  inviteToken: string;
}) {
  const baseUrl = getBaseUrl();
  const approveLink = `${baseUrl}/invite/approve/${approvalToken}`;
  const declineLink = `${baseUrl}/invite/decline/${approvalToken}`;

  const formattedDate = hangDate
    ? new Date(hangDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const hangSection = hangTitle
    ? `
      <div style="margin: 24px 0; padding: 20px; background-color: #f3f4f6; border-radius: 12px; border-left: 4px solid #8b5cf6;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">They're also invited to:</p>
        <p style="margin: 0 0 8px 0; font-size: 20px; font-weight: bold; color: #111827;">${hangTitle}</p>
        ${formattedDate ? `<p style="margin: 0; font-size: 16px; color: #6b7280;">${formattedDate}</p>` : ""}
      </div>
    `
    : "";

  try {
    const { data, error } = await resend.emails.send({
      from: "HangHub <onboarding@resend.dev>",
      to: [parentEmail],
      subject: `${inviteeName} was invited to join HangHub!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #8b5cf6;">${inviteeName} was invited to HangHub!</h1>

          <p style="font-size: 16px; color: #4b5563;"><strong>${inviterName}</strong> wants to be friends with <strong>${inviteeName}</strong> on HangHub.</p>

          ${hangSection}

          <div style="margin: 24px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #111827;">What is HangHub?</p>
            <p style="margin: 0; color: #4b5563;">HangHub is an app that helps kids plan sleepovers, after-school hangs, and more - with built-in parental approval so you always know what's happening.</p>
          </div>

          <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">Would you like to create an account for ${inviteeName}?</p>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto;">
            <tr>
              <td style="padding-right: 8px;">
                <a href="${approveLink}" style="background-color: #22c55e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; text-align: center;">
                  Yes, Create Account
                </a>
              </td>
              <td style="padding-left: 8px;">
                <a href="${declineLink}" style="background-color: #ef4444; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; text-align: center;">
                  No Thanks
                </a>
              </td>
            </tr>
          </table>

          <p style="margin-top: 30px; font-size: 14px; color: #9ca3af; text-align: center;">If you didn't expect this email, you can safely ignore it.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { error };
    }

    return { data };
  } catch (err) {
    console.error("Failed to send QR invite email:", err);
    return { error: err };
  }
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  token: string
) {
  const verificationLink = `${
    getBaseUrl()
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
