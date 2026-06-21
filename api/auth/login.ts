import { Request, Response } from "express";
import { DatabaseService, ensureDatabaseInitialized } from "../../server/db";
import { AuthService } from "../../server/auth";

export default async function handler(req: Request, res: Response) {
  res.setHeader("Content-Type", "application/json");

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }

  console.log(`\nAPI REQUEST:\n/api/auth/login`);
  console.log(`ENV CHECK:\nDATABASE_URL available:\n${!!process.env.DATABASE_URL}`);
  console.log("DATABASE CONNECTION START");

  try {
    await ensureDatabaseInitialized();
    console.log("DATABASE CONNECTION SUCCESS");

    const { email, password, username } = req.body;
    const loginIdentifier = (email || username || "").trim().toLowerCase();
    
    if (!loginIdentifier || !password) {
      const msg = "Email and password are required fields";
      console.log("LOGIN FAILURE: " + msg);
      console.log("API RESPONSE SENT:\nsuccess:\nfalse");
      return res.status(400).json({ success: false, message: msg, error: msg });
    }

    console.log("DATABASE QUERY:\nSELECT content key adminUsers");
    const db = DatabaseService.read();
    const hasRecord = !!(db.adminUsers && db.adminUsers.length > 0);
    console.log(`DATABASE RESPONSE:\nrecord found:\n${hasRecord}`);

    if (!db.adminUsers || db.adminUsers.length === 0) {
      const msg = "Authentication database has not been initialized";
      console.log("LOGIN FAILURE: " + msg);
      console.log("API RESPONSE SENT:\nsuccess:\nfalse");
      return res.status(500).json({ success: false, message: msg, error: msg });
    }

    // Find the admin user with matching email address
    const adminUser = db.adminUsers.find(u => u.email.toLowerCase() === loginIdentifier);
    if (!adminUser) {
      const msg = "Invalid email or password.";
      console.log("LOGIN FAILURE: " + msg);
      console.log("API RESPONSE SENT:\nsuccess:\nfalse");
      return res.status(401).json({ success: false, message: msg, error: msg });
    }

    const isValid = await AuthService.comparePassword(password, adminUser.passwordHash);
    if (!isValid) {
      const msg = "Invalid email or password.";
      console.log("LOGIN FAILURE: " + msg);
      console.log("API RESPONSE SENT:\nsuccess:\nfalse");
      return res.status(401).json({ success: false, message: msg, error: msg });
    }

    // Update lastLogin timestamp
    adminUser.lastLogin = new Date().toISOString();
    await DatabaseService.writeAsync(db);

    const token = AuthService.createToken({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      tokenVersion: adminUser.tokenVersion
    });

    console.log("LOGIN SUCCESS");
    console.log("API RESPONSE SENT:\nsuccess:\ntrue");
    return res.status(200).json({
      success: true,
      message: "Authentication established successfully",
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        lastLogin: adminUser.lastLogin
      }
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
