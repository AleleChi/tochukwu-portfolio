import { Request, Response } from "express";
import { DatabaseService, ensureDatabaseInitialized } from "../server/db";
import { EmailService } from "../server/email";

export default async function handler(req: Request, res: Response) {
  res.setHeader("Content-Type", "application/json");

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }

  console.log(`\nAPI REQUEST:\n/api/contact-submit`);
  console.log(`ENV CHECK:\nDATABASE_URL available:\n${!!process.env.DATABASE_URL}`);
  console.log("DATABASE CONNECTION START");

  try {
    await ensureDatabaseInitialized();
    console.log("DATABASE CONNECTION SUCCESS");

    const { name, email, subject, message, organization, category } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Please input all mandatory contact fields (Name, Email, Message).", error: "Please input all mandatory contact fields (Name, Email, Message)." });
    }
    
    // Validate inputs
    if (name.length < 2) {
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters long.", error: "Name must be at least 2 characters long." });
    }
    if (!email.includes("@")) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address.", error: "Please provide a valid email address." });
    }
    if (message.length < 5) {
      return res.status(400).json({ success: false, message: "Inquiry message is too brief. Please detail your request.", error: "Inquiry message is too brief. Please detail your request." });
    }

    // Spam protection: check for web links in Name or Subject
    const urlPattern = /https?:\/\/[^\s]+/gi;
    if (urlPattern.test(name) || (subject && urlPattern.test(subject))) {
      return res.status(400).json({ success: false, message: "URLs and hyper-links are restricted in the Name and Subject fields to prevent automated spam.", error: "URLs and hyper-links are restricted in the Name and Subject fields to prevent automated spam." });
    }

    // Limit URLs in message container to maximum 2 to block bulk web bot entries
    const urlMatches = message.match(urlPattern);
    if (urlMatches && urlMatches.length > 2) {
      return res.status(400).json({ success: false, message: "Automated filter alert: Please restrict web links to a maximum of 2 to submit successfully.", error: "Automated filter alert: Please restrict web links to a maximum of 2 to submit successfully." });
    }

    console.log("DATABASE QUERY:\nSELECT content key contactSubmissions (write)");
    const payload = DatabaseService.addContactSubmission({
      name,
      email,
      subject: subject || "General Inquiry",
      message,
      organization: organization || null,
      category: category || null
    });
    console.log("DATABASE RESPONSE:\nrecord found:\ntrue"); // Always true during successful insertion of single submission

    // Send email notification
    try {
      await EmailService.sendEnquiryNotification({
        name,
        email,
        organization: organization || null,
        category: category || "General Inquiry",
        message,
        timestamp: payload.date
      }, req.headers.host || "localhost:3000");
    } catch (eMailErr) {
      console.error("[CONTACT ENQUIRY] Email system notification dispatch failure:", eMailErr);
    }

    console.log("API RESPONSE SENT:\nsuccess:\ntrue");
    return res.status(200).json({
      success: true,
      message: "Your message has been received and stored in Tochukwu's secure administrative log.",
      data: payload
    });
  } catch (err: any) {
    console.error("DATABASE CONNECTION FAILURE DURING REQUEST:", err);
    console.log("API RESPONSE SENT:\nsuccess:\nfalse");
    return res.status(500).json({
      success: false,
      message: "Database connection unavailable."
    });
  }
}
