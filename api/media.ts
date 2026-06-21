import { Request, Response } from "express";
import { DatabaseService, ensureDatabaseInitialized } from "../server/db";
import { AuthService } from "../server/auth";

export default async function handler(req: Request, res: Response) {
  res.setHeader("Content-Type", "application/json");

  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }

  console.log(`\nAPI REQUEST:\n/api/media`);
  console.log(`ENV CHECK:\nDATABASE_URL available:\n${!!process.env.DATABASE_URL}`);
  console.log("DATABASE CONNECTION START");

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Authentication challenge token required" });
    }
    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, error: "Access token is invalid or expired" });
    }

    await ensureDatabaseInitialized();
    console.log("DATABASE CONNECTION SUCCESS");

    console.log("DATABASE QUERY:\nSELECT content key media");
    const list = DatabaseService.getMedia();
    const hasRecord = !!(list && list.length > 0);
    console.log(`DATABASE RESPONSE:\nrecord found:\n${hasRecord}`);

    console.log("API RESPONSE SENT:\nsuccess:\ntrue");
    return res.status(200).json({ success: true, data: list });
  } catch (err: any) {
    console.error("DATABASE CONNECTION FAILURE DURING REQUEST:", err);
    console.log("API RESPONSE SENT:\nsuccess:\nfalse");
    return res.status(500).json({
      success: false,
      message: "Database connection unavailable."
    });
  }
}
