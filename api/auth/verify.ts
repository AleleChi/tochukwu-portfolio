import { Request, Response } from "express";
import { ensureDatabaseInitialized } from "../../server/db";
import { AuthService } from "../../server/auth";

export default async function handler(req: Request, res: Response) {
  res.setHeader("Content-Type", "application/json");

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }

  console.log(`\nAPI REQUEST:\n/api/auth/verify`);
  console.log(`ENV CHECK:\nDATABASE_URL available:\n${!!process.env.DATABASE_URL}`);
  console.log("DATABASE CONNECTION START");

  try {
    await ensureDatabaseInitialized();
    console.log("DATABASE CONNECTION SUCCESS");

    const token = req.body.token;
    if (!token) {
      console.log("API RESPONSE SENT:\nsuccess:\nfalse");
      return res.status(400).json({ success: false, error: "Verification token required" });
    }

    console.log("DATABASE QUERY:\nSELECT content key adminUsers (token verify)");
    const decoded = AuthService.verifyToken(token);
    const hasRecord = !!decoded;
    console.log(`DATABASE RESPONSE:\nrecord found:\n${hasRecord}`);

    if (decoded) {
      console.log("API RESPONSE SENT:\nsuccess:\ntrue");
      return res.status(200).json({ 
        success: true, 
        username: decoded.email, 
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        user: decoded
      });
    } else {
      console.log("API RESPONSE SENT:\nsuccess:\nfalse");
      return res.status(401).json({ success: false, error: "Token signature expired or broken" });
    }

  } catch (err: any) {
    console.error("DATABASE CONNECTION FAILURE DURING REQUEST:", err);
    console.log("API RESPONSE SENT:\nsuccess:\nfalse");
    return res.status(500).json({
      success: false,
      message: "Database connection unavailable."
    });
  }
}
