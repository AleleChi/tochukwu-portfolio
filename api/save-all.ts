import { Request, Response } from "express";
import { DatabaseService, ensureDatabaseInitialized, DatabaseSchema } from "../server/db";
import { AuthService } from "../server/auth";

async function validateAndWriteDb(db: any, res: Response, isPartialImageUpdate: boolean = false) {
  try {
    const normalizedDb = DatabaseService.normalize(db);
    const parsed = DatabaseSchema.safeParse(normalizedDb);
    
    if (!parsed.success) {
      console.error("\n--- [VALIDATION WARNING/ERROR DETAILS] ---");
      const warnings: string[] = [];
      const failedFields: string[] = [];
      parsed.error.issues.forEach((issue) => {
        const pathSegments = issue.path;
        const fieldPath = pathSegments.reduce<string>((acc, segment: any) => {
          if (typeof segment === "number") {
            return `${acc}[${segment}]`;
          }
          return acc ? `${acc}.${String(segment)}` : String(segment);
        }, "");
        
        console.error(`FAILED FIELD:\n${fieldPath}`);
        failedFields.push(fieldPath);
        warnings.push(`${fieldPath}: ${issue.message}`);
      });
      console.error("------------------------------------------\n");

      const saved = await DatabaseService.writeAsync(normalizedDb);
      if (!saved) {
        return res.status(500).json({ success: false, error: "Database saving failure saving changes" });
      }

      if (isPartialImageUpdate) {
        return res.json({
          success: true,
          message: "Image uploaded and persisted successfully! ✓",
          data: normalizedDb
        });
      }

      return res.json({
        success: true,
        message: "Profile image saved but another profile field requires attention",
        isPartialWarning: true,
        failedFields,
        warnings,
        data: normalizedDb
      });
    }

    const saved = await DatabaseService.writeAsync(normalizedDb);
    if (!saved) {
      return res.status(500).json({ success: false, error: "Database saving failure saving changes" });
    }

    return res.json({
      success: true,
      message: "Portfolio data successfully saved and synchronized.",
      data: normalizedDb
    });
  } catch (err: any) {
    console.error("[VALIDATE-WRITE ERROR]", err);
    return res.status(500).json({ success: false, error: err.message || "Failure persisting changes" });
  }
}

export default async function handler(req: Request, res: Response) {
  res.setHeader("Content-Type", "application/json");

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }

  console.log(`\nAPI REQUEST:\n/api/save-all`);
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

    const bodyArgs = req.body;
    if (!bodyArgs || typeof bodyArgs !== "object") {
      return res.status(400).json({ success: false, error: "Saved information must be a valid JSON map" });
    }

    console.log("DATABASE QUERY:\nSELECT content key save-all (write)");
    const db = DatabaseService.read();
    const hasRecord = !!db;
    console.log(`DATABASE RESPONSE:\nrecord found:\n${hasRecord}`);

    // Selectively parse and save components in memory to avoid intermediate disk writes
    if (bodyArgs.profile) {
      db.profile = {
        ...bodyArgs.profile,
        updatedAt: new Date().toISOString(),
        createdAt: db.profile?.createdAt || new Date().toISOString()
      };
    }
    if (bodyArgs.hero) {
      db.hero = {
        ...bodyArgs.hero,
        updatedAt: new Date().toISOString(),
        createdAt: db.hero?.createdAt || new Date().toISOString()
      };
    }
    if (bodyArgs.practice) {
      db.practice = bodyArgs.practice;
    }
    if (bodyArgs.areasOfPractice) {
      db.areasOfPractice = bodyArgs.areasOfPractice;
    }
    if (bodyArgs.experience) {
      db.experience = bodyArgs.experience.map((item: any) => ({
        ...item,
        id: item.id || Math.random().toString(36).substr(2, 9),
        status: item.status || "published",
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
    if (bodyArgs.gallery) {
      db.gallery = bodyArgs.gallery.map((item: any) => ({
        ...item,
        id: item.id !== undefined ? item.id : Date.now() + Math.floor(Math.random() * 100),
        status: item.status || "published",
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
    if (bodyArgs.speaking) {
      db.speaking = {
        ...bodyArgs.speaking,
        updatedAt: new Date().toISOString(),
        createdAt: db.speaking?.createdAt || new Date().toISOString()
      };
    }
    if (bodyArgs.recognition) {
      db.recognition = {
        ...bodyArgs.recognition,
        updatedAt: new Date().toISOString(),
        createdAt: db.recognition?.createdAt || new Date().toISOString()
      };
    }
    if (bodyArgs.certifications) {
      db.certifications = bodyArgs.certifications;
    }
    if (bodyArgs.education) {
      db.education = bodyArgs.education;
    }
    if (bodyArgs.articles) {
      db.articles = bodyArgs.articles.map((item: any) => ({
        ...item,
        id: item.id !== undefined ? item.id : Date.now() + Math.floor(Math.random() * 100),
        status: item.status || "published",
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
    if (bodyArgs.testimonials) {
      db.testimonials = bodyArgs.testimonials.map((item: any) => ({
        ...item,
        id: item.id !== undefined ? item.id : Date.now() + Math.floor(Math.random() * 100),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
    if (bodyArgs.media) {
      db.media = bodyArgs.media;
    }

    console.log("API RESPONSE SENT:\nsuccess:\ntrue");
    return await validateAndWriteDb(db, res);
  } catch (err: any) {
    console.error("DATABASE CONNECTION FAILURE DURING REQUEST:", err);
    console.log("API RESPONSE SENT:\nsuccess:\nfalse");
    return res.status(500).json({
      success: false,
      message: "Database connection unavailable."
    });
  }
}
