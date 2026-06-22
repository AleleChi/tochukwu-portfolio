import nodemailer from "nodemailer";
import { google } from "googleapis";

export interface EmailPayload {
  name: string;
  email: string;
  organization?: string | null;
  category?: string | null;
  message: string;
  timestamp: string;
}

// Creates a fresh OAuth2 transporter using Gmail API credentials
async function createGmailTransporter() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const smtpUser = process.env.SMTP_USER;

  if (!clientId || !clientSecret || !refreshToken || !smtpUser) {
    throw new Error("Missing Gmail OAuth2 credentials. Ensure GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, and SMTP_USER are set.");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const accessTokenResponse = await oauth2Client.getAccessToken();
  const accessToken = accessTokenResponse?.token;

  if (!accessToken) {
    throw new Error("Failed to retrieve Gmail OAuth2 access token.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: smtpUser,
      clientId,
      clientSecret,
      refreshToken,
      accessToken
    }
  });

  return { transporter, smtpUser };
}

export class EmailService {
  /**
   * Verify SMTP connection properties and log configuration presence securely.
   */
  public static async verifySmtpConnection() {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const smtpUser = process.env.SMTP_USER;

    console.log(`GMAIL_CLIENT_ID loaded: ${!!clientId}`);
    console.log(`GMAIL_CLIENT_SECRET loaded: ${!!clientSecret}`);
    console.log(`GMAIL_REFRESH_TOKEN loaded: ${!!refreshToken}`);
    console.log(`SMTP_USER loaded: ${!!smtpUser}`);

    if (!clientId || !clientSecret || !refreshToken || !smtpUser) {
      console.log("[SMTP] Skipping check: Gmail OAuth2 environment variables are not fully configured.");
      return;
    }

    try {
      const { transporter } = await createGmailTransporter();
      await transporter.verify();
      console.log("SMTP CONNECTION SUCCESS");
    } catch (err: any) {
      console.error("SMTP CONNECTION FAILED:", err.message || err);
    }
  }

  /**
   * Send a temporary test email to substantiate Gmail OAuth2 delivery on Render.
   */
  public static async sendTestEmail() {
    const emailTo = process.env.EMAIL_TO;
    if (!emailTo) {
      console.log("EMAIL TEST SEND FAILED");
      return { success: false, error: "EMAIL_TO environment variable is missing for Test Email." };
    }
    const recipients = emailTo.split(",").map(email => email.trim()).filter(Boolean);

    console.log(`GMAIL_CLIENT_ID loaded: ${!!process.env.GMAIL_CLIENT_ID}`);
    console.log(`GMAIL_CLIENT_SECRET loaded: ${!!process.env.GMAIL_CLIENT_SECRET}`);
    console.log(`GMAIL_REFRESH_TOKEN loaded: ${!!process.env.GMAIL_REFRESH_TOKEN}`);
    console.log(`SMTP_USER loaded: ${!!process.env.SMTP_USER}`);

    try {
      const { transporter, smtpUser } = await createGmailTransporter();

      await transporter.verify();
      console.log("SMTP CONNECTION SUCCESS");
      console.log("EMAIL TEST SEND START");

      const info = await transporter.sendMail({
        from: `Tochukwu Website <${smtpUser}>`,
        replyTo: smtpUser,
        to: recipients,
        subject: "Render Production Email Test",
        html: `<p>This confirms Gmail OAuth2 delivery from Render.</p>`,
        text: `This confirms Gmail OAuth2 delivery from Render.`
      });

      console.log("LOG:\nSMTP SEND DONE (TEST)");
      console.log(`- messageId: ${info.messageId || "N/A"}`);
      console.log(`- accepted: ${JSON.stringify(info.accepted || [])}`);
      console.log(`- rejected: ${JSON.stringify(info.rejected || [])}`);
      console.log(`- response: ${info.response || "N/A"}`);
      console.log(`- envelope: ${JSON.stringify(info.envelope || {})}`);

      const acceptedList = Array.isArray(info.accepted)
        ? info.accepted.map((r: any) => typeof r === "string" ? r.toLowerCase() : JSON.stringify(r))
        : [];

      const hasAccepted = recipients.some(recip =>
        acceptedList.some(acc => acc.includes(recip.toLowerCase()))
      );

      if (!hasAccepted) {
        const errorDetail = `No destination email found in accepted recipients. Accepted: ${JSON.stringify(info.accepted)}`;
        console.log("EMAIL TEST SEND FAILED");
        return { success: false, error: errorDetail };
      }

      console.log("EMAIL TEST SEND SUCCESS");
      return { success: true };
    } catch (err: any) {
      console.log("EMAIL TEST SEND FAILED");
      console.error("SMTP TEST FAILED:", err);
      if (err.code) console.log("error.code:", err.code);
      if (err.response) console.log("error.response:", err.response);
      if (err.command) console.log("error.command:", err.command);
      return {
        success: false,
        error: err.message || String(err),
        code: err.code,
        response: err.response,
        command: err.command
      };
    }
  }

  /**
   * Send notification email immediately when a contact form is submitted.
   */
  public static async sendEnquiryNotification(payload: EmailPayload, originHost: string = "localhost:3000") {
    const emailTo = process.env.EMAIL_TO;
    if (!emailTo) {
      const errMsg = "EMAIL_TO environment variable is missing for notification delivery.";
      console.error(errMsg);
      return { success: false, error: errMsg };
    }
    const recipients = emailTo.split(",").map(email => email.trim()).filter(Boolean);

    // Fallback simulation if OAuth2 credentials are missing
    if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN || !process.env.SMTP_USER) {
      console.log(`
============================================================
[SIMULATED EMAIL NOTIFICATION DISPATCH]
To configure ACTUAL delivery, set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, SMTP_USER.
Recipients: ${recipients.join(", ")}
Subject: New Professional Enquiry — Tochukwu Ogunaka
------------------------------------------------------------
Hello Tochukwu,

You have received a new enquiry through your professional website.

Name: ${payload.name}
Email: ${payload.email}
Organization: ${payload.organization || "Not Specified"}
Area of Interest: ${payload.category || "General Enquiry"}

Message:
${payload.message}

Submitted: ${new Date(payload.timestamp).toLocaleString()}
============================================================
      `);
      return { success: true, simulated: true };
    }

    const textBody = `Hello Tochukwu,

You have received a new enquiry through your professional website.

Contact Details

Name:
${payload.name}

Email:
${payload.email}

Organization:
${payload.organization || "Not Specified"}

Area of Interest:
${payload.category || "General Enquiry"}

Message:

${payload.message}

Submitted:
${new Date(payload.timestamp).toLocaleString()}

Please review this enquiry when convenient.

Regards,

Tochukwu Ogunaka
Communication Professional & Media Specialist`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; background-color: #FDFBF7; border: 1px solid #E5E5E2; color: #1C1C1E; line-height: 1.6; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);">
        <div style="border-bottom: 1px solid #C9A84C; padding-bottom: 24px; margin-bottom: 32px; text-align: left;">
          <h1 style="font-family: 'Lora', Georgia, serif; font-size: 22px; font-weight: normal; margin: 0; color: #1C1C1E; letter-spacing: -0.01em;">New Professional Enquiry</h1>
        </div>
        
        <p style="font-size: 15px; color: #1C1C1E; margin-bottom: 32px; font-family: 'Lora', Georgia, serif; font-style: italic;">Hello Tochukwu,</p>
        
        <p style="font-size: 14px; color: #1C1C1E; margin-bottom: 32px;">You have received a new enquiry through your professional website.</p>
        
        <h3 style="font-family: 'Lora', Georgia, serif; font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #C9A84C; border-bottom: 1px solid #E5E5E2; padding-bottom: 8px; margin-bottom: 16px;">Contact Details</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 14px;">
          <tr>
            <td style="padding: 10px 0; font-weight: 500; width: 150px; color: #8E8E93;">Name:</td>
            <td style="padding: 10px 0; color: #1C1C1E; font-weight: bold;">${payload.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 500; color: #8E8E93;">Email:</td>
            <td style="padding: 10px 0; color: #1C1C1E;"><a href="mailto:${payload.email}" style="color: #C9A84C; text-decoration: none; border-bottom: 1px solid rgba(201, 168, 76, 0.3);">${payload.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 500; color: #8E8E93;">Organization:</td>
            <td style="padding: 10px 0; color: #1C1C1E;">${payload.organization || "Not Specified"}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 500; color: #8E8E93;">Area of Interest:</td>
            <td style="padding: 10px 0; color: #1C1C1E; font-weight: bold;">${payload.category || "General Enquiry"}</td>
          </tr>
        </table>

        <h3 style="font-family: 'Lora', Georgia, serif; font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #C9A84C; border-bottom: 1px solid #E5E5E2; padding-bottom: 8px; margin-bottom: 16px;">Message</h3>
        
        <div style="background-color: #F7F6F2; border-left: 2px solid #C9A84C; padding: 20px; font-size: 14.5px; line-height: 1.7; color: #2C2C2E; font-family: inherit; margin-bottom: 32px; white-space: pre-wrap; font-style: italic;">${payload.message}</div>

        <p style="font-size: 13px; color: #8E8E93; margin-bottom: 40px; font-family: monospace;">Submitted: ${new Date(payload.timestamp).toLocaleString()}</p>
        
        <p style="font-size: 14px; color: #1C1C1E; margin-bottom: 32px;">Please review this enquiry when convenient.</p>
        
        <div style="border-top: 1px solid #E5E5E2; padding-top: 24px; font-size: 14px; color: #1C1C1E; font-family: 'Lora', Georgia, serif;">
          <p style="margin: 0 0 4px 0; font-weight: bold;">Regards,</p>
          <p style="margin: 0 0 2px 0; font-size: 15px; color: #1C1C1E;">Tochukwu Ogunaka</p>
          <p style="margin: 0; font-size: 12px; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.05em;">Communication Professional & Media Specialist</p>
        </div>
      </div>
    `;

    try {
      const { transporter, smtpUser } = await createGmailTransporter();

      // console.log("[SMTP] Verifying connection...");
      // await transporter.verify();
      // console.log("SMTP CONNECTION SUCCESS");

      const info = await transporter.sendMail({
        from: `Tochukwu Website <${smtpUser}>`,
        replyTo: payload.email,
        to: recipients,
        subject: `New Professional Enquiry — Tochukwu Ogunaka`,
        html: htmlBody,
        text: textBody
      });

      console.log("LOG:\nSMTP SEND DONE");
      console.log(`- messageId: ${info.messageId || "N/A"}`);
      console.log(`- accepted: ${JSON.stringify(info.accepted || [])}`);
      console.log(`- rejected: ${JSON.stringify(info.rejected || [])}`);
      console.log(`- response: ${info.response || "N/A"}`);
      console.log(`- envelope: ${JSON.stringify(info.envelope || {})}`);

      const acceptedList = Array.isArray(info.accepted)
        ? info.accepted.map((r: any) => typeof r === "string" ? r.toLowerCase() : JSON.stringify(r))
        : [];

      const hasAccepted = recipients.some(recip =>
        acceptedList.some(acc => acc.includes(recip.toLowerCase()))
      );

      if (!hasAccepted) {
        const errorDetail = `No destination email found in accepted recipients. Accepted: ${JSON.stringify(info.accepted)}`;
        console.log(`LOG:\nEMAIL SEND FAILED + ERROR: ${errorDetail}`);
        return { success: false, error: errorDetail };
      }

      console.log(`[SMTP] Success! Email message sent successfully: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error(`LOG:\nEMAIL SEND FAILED + ERROR: ${err.message || String(err)}`);
      return { success: false, error: err.message || String(err) };
    }
  }

  /**
   * Send a professional reply to the client/visitor immediately.
   */
  public static async sendResponseReply(recipientName: string, recipientEmail: string, subject: string, replyMessage: string) {
    const textBody = `Hello ${recipientName},

Thank you for reaching out.

${replyMessage}

I appreciate your interest and will be glad to discuss this further.

Regards,

Tochukwu Ogunaka
Communication Professional & Media Specialist`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; background-color: #FDFBF7; border: 1px solid #E5E5E2; color: #1C1C1E; line-height: 1.6; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);">
        <div style="border-bottom: 1px solid #C9A84C; padding-bottom: 24px; margin-bottom: 32px; text-align: left;">
          <h1 style="font-family: 'Lora', Georgia, serif; font-size: 22px; font-weight: normal; margin: 0; color: #1C1C1E; letter-spacing: -0.01em;">Tochukwu Ogunaka</h1>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.1em; font-family: monospace;">Response Correspondence</p>
        </div>
        
        <p style="font-size: 15px; color: #1C1C1E; margin-bottom: 24px; font-family: 'Lora', Georgia, serif; font-style: italic;">Hello ${recipientName},</p>
        
        <p style="font-size: 14px; color: #1C1C1E; margin-bottom: 24px;">Thank you for reaching out.</p>
        
        <div style="background-color: #F7F6F2; border-left: 2px solid #C9A84C; padding: 20px; font-size: 14.5px; line-height: 1.7; color: #2C2C2E; font-family: inherit; margin-bottom: 24px; white-space: pre-wrap;">${replyMessage}</div>
        
        <p style="font-size: 14px; color: #1C1C1E; margin-bottom: 32px;">I appreciate your interest and will be glad to discuss this further.</p>
        
        <div style="border-top: 1px solid #E5E5E2; padding-top: 24px; font-size: 14px; color: #1C1C1E; font-family: 'Lora', Georgia, serif;">
          <p style="margin: 0 0 4px 0; font-weight: bold;">Regards,</p>
          <p style="margin: 0 0 2px 0; font-size: 15px; color: #1C1C1E;">Tochukwu Ogunaka</p>
          <p style="margin: 0; font-size: 12px; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.05em;">Communication Professional & Media Specialist</p>
        </div>
      </div>
    `;

    if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN || !process.env.SMTP_USER) {
      console.log(`
============================================================
[SIMULATED EMAIL REPLY DISPATCH]
To configure ACTUAL delivery, set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, SMTP_USER.
Recipient: ${recipientEmail}
Subject: ${subject}
============================================================
      `);
      return { success: true, simulated: true };
    }

    try {
      const { transporter, smtpUser } = await createGmailTransporter();

      const info = await transporter.sendMail({
        from: `Tochukwu Ogunaka <${smtpUser}>`,
        to: recipientEmail,
        subject: subject,
        html: htmlBody,
        text: textBody
      });

      console.log(`[SMTP REPLY] Success! Reply sent to ${recipientEmail}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error(`[SMTP REPLY ERROR] Failed to send reply:`, err.message || err);
      return { success: false, error: err.message || String(err) };
    }
  }
}