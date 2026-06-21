import { Request, Response } from "express";
import { DatabaseService, ensureDatabaseInitialized } from "../server/db";

export default async function handler(req: Request, res: Response) {
  res.setHeader("Content-Type", "application/json");

  console.log(`\nAPI REQUEST:\n/api/experience`);
  console.log(`ENV CHECK:\nDATABASE_URL available:\n${!!process.env.DATABASE_URL}`);
  console.log("DATABASE CONNECTION START");

  try {
    await ensureDatabaseInitialized();
    console.log("DATABASE CONNECTION SUCCESS");

    console.log("DATABASE QUERY:\nSELECT content key experience");
    const includeInactive = req.query.includeInactive === "true" || !!req.headers.authorization;
    const data = DatabaseService.getExperiences(includeInactive);
    const hasRecord = !!(data && data.length > 0);
    console.log(`DATABASE RESPONSE:\nrecord found:\n${hasRecord}`);

    console.log("API RESPONSE SENT:\nsuccess:\ntrue");
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error("DATABASE CONNECTION FAILURE DURING REQUEST:", err);
    console.log("API RESPONSE SENT:\nsuccess:\nfalse");
    return res.status(500).json({
      success: false,
      message: "Database connection unavailable."
    });
  }
}
