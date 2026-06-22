import nodemailer from "nodemailer";

export interface EmailPayload {
  name: string;
  email: string;
  organization?: string | null;
  category?: string | null;
  message: string;
  timestamp: string;
}

export class EmailService {
  /**
   * Verify SMTP connection properties and log configuration presence securely.
   */
  public static async verifySmtpConnection() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM;

    console.log(`SMTP_HOST loaded: ${!!smtpHost}`);
    console.log(`SMTP_USER loaded: ${!!smtpUser}`);
    console.log(`SMTP_PASS loaded: ${!!smtpPass}`);
    console.log(`SMTP_FROM loaded: ${!!smtpFrom}`);

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log("[SMTP] Skipping SMTP check: SMTP environment variables are not fully configured.");
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
        secure: (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      await transporter.verify();
      console.log("SMTP CONNECTION SUCCESS");
    } catch (err: any) {
      console.error("SMTP CONNECTION FAILED:", err.message || err);
    }
  }

  /**
   * Send a temporary test email to substantiate SMTP delivery on Render.
   */
  public static async sendTestEmail() {
    const recipients = ["ogunakatochukwu@gmail.com", "alelechi17@gmail.com"];
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    let rawSmtpFrom = process.env.SMTP_FROM || "ogunakatochukwu@gmail.com";
    
    let cleanEmail = rawSmtpFrom;
    const match = rawSmtpFrom.match(/<([^>]+)>/);
    if (match) {
      cleanEmail = match[1];
    }
    const smtpFrom = `Tochukwu Website <${cleanEmail}>`;

    console.log(`SMTP_HOST loaded: ${!!smtpHost}`);
    console.log(`SMTP_USER loaded: ${!!smtpUser}`);
    console.log(`SMTP_PASS loaded: ${!!smtpPass}`);
    console.log(`SMTP_FROM loaded: ${!!rawSmtpFrom}`);

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log("EMAIL TEST SEND FAILED");
      return { success: false, error: "SMTP configuration missing for Test Email." };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.verify();
      console.log("SMTP CONNECTION SUCCESS");

      console.log("EMAIL TEST SEND START");

      const mailOptions = {
        from: smtpFrom,
        replyTo: "noreply@tochukwu.com",
        to: recipients,
        subject: "Render Production Email Test",
        html: `<p>This confirms SMTP delivery from Render.</p>`,
        text: `This confirms SMTP delivery from Render.`
      };

      const info = await transporter.sendMail(mailOptions);

      console.log("LOG:\nSMTP SEND DONE (TEST)");
      console.log(`- messageId: ${info.messageId || "N/A"}`);
      console.log(`- accepted: ${JSON.stringify(info.accepted || [])}`);
      console.log(`- rejected: ${JSON.stringify(info.rejected || [])}`);
      console.log(`- response: ${info.response || "N/A"}`);
      console.log(`- envelope: ${JSON.stringify(info.envelope || {})}`);

      const acceptedList = Array.isArray(info.accepted) 
        ? info.accepted.map((r: any) => typeof r === 'string' ? r.toLowerCase() : JSON.stringify(r)) 
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
      console.error(`[SMTP TEST ERROR] Test email dispatch failed:`, err.message || err);
      return { success: false, error: err.message || String(err) };
    }
  }
  /**
   * Send notification email immediately when a contact form is submitted.
   * If SMTP settings are missing, does a clean diagnostic log.
   */
  public static async sendEnquiryNotification(payload: EmailPayload, originHost: string = "localhost:3000") {
    const recipients = ["ogunakatochukwu@gmail.com", "alelechi17@gmail.com"];
    
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    let rawSmtpFrom = process.env.SMTP_FROM || "ogunakatochukwu@gmail.com";
    let cleanEmail = rawSmtpFrom;
    const match = rawSmtpFrom.match(/<([^>]+)>/);
    if (match) {
      cleanEmail = match[1];
    }
    const smtpFrom = `Tochukwu Website <${cleanEmail}>`;

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

    // Strict validation of SMTP environment configurations
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log(`
============================================================
[SIMULATED EMAIL NOTIFICATION DISPATCH]
To configure ACTUAL SMTP delivery, specify SMTP_HOST, SMTP_USER, SMTP_PASS inside AI Studio secrets or your .env file.
Recipients: ${recipients.join(", ")}
Subject: New Professional Enquiry — Tochukwu Ogunaka
------------------------------------------------------------
Hello Tochukwu,

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
Communication Professional & Media Specialist
============================================================
      `);
      return { success: true, simulated: true };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log("[SMTP] Verifying connection...");
      await transporter.verify();
      console.log("SMTP CONNECTION SUCCESS");

      const info = await transporter.sendMail({
        from: smtpFrom,
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

      // Gmail compatibility / Acceptance Check
      const acceptedList = Array.isArray(info.accepted) 
        ? info.accepted.map((r: any) => typeof r === 'string' ? r.toLowerCase() : JSON.stringify(r)) 
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
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    let smtpFrom = process.env.SMTP_FROM || `"Tochukwu Ogunaka" <ogunakatochukwu@gmail.com>`;
    if (process.env.SMTP_FROM && !process.env.SMTP_FROM.includes("<")) {
      smtpFrom = `"Tochukwu Ogunaka" <${process.env.SMTP_FROM}>`;
    }

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

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log(`
============================================================
[SIMULATED EMAIL REPLY DISPATCH]
To configure ACTUAL SMTP delivery, specify SMTP_HOST, SMTP_USER, SMTP_PASS inside AI Studio secrets or your .env file.
Recipient: ${recipientEmail}
Subject: ${subject}
------------------------------------------------------------
Hello ${recipientName},

Thank you for reaching out.

${replyMessage}

I appreciate your interest and will be glad to discuss this further.

Regards,

Tochukwu Ogunaka
Communication Professional & Media Specialist
============================================================
      `);
      return { success: true, simulated: true };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to: recipientEmail,
        subject: subject,
        html: htmlBody,
        text: textBody
      });

      console.log(`[SMTP REPLY] Success! Reply sent to ${recipientEmail}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error(`[SMTP REPLY ERROR] Failed to send reply via SMTP:`, err.message || err);
      return { success: false, error: err.message || String(err) };
    }
  }
}
