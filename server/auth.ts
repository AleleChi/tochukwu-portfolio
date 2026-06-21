import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { DatabaseService } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "tochukwu-ogunaka-comms-vault-secure-jwt-token-2026";

// Extend Request interface inside a namespace or cast to handle custom logged-in user details
export interface AuthenticatedRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    name: string;
    role: "Studio Owner" | "Administrator";
  };
}

export class AuthService {
  // Hash password securely
  public static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  // Compare passwords
  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Create JWT token for active session
  public static createToken(user: { id: string; email: string; name: string; role: "Studio Owner" | "Administrator"; tokenVersion?: string }): string {
    return jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, tokenVersion: user.tokenVersion || "" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
  }

  // Verify active JWT token
  public static verifyToken(token: string): { id: string; email: string; name: string; role: "Studio Owner" | "Administrator"; tokenVersion?: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded && decoded.id && decoded.email) {
        // Read the database to ensure user exists AND check tokenVersion!
        const db = DatabaseService.read();
        const user = db.adminUsers?.find(u => u.id === decoded.id);
        if (!user) {
          return null;
        }

        // Optional token version checking to support session invalidation (logout of other sessions / change password)
        const userTokenVersion = user.tokenVersion || "";
        const decodedTokenVersion = decoded.tokenVersion || "";
        if (userTokenVersion && decodedTokenVersion !== userTokenVersion) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tokenVersion: userTokenVersion
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  // Seed both admin accounts if not already initialized
  public static async seedAdminAccounts(): Promise<void> {
    const db = DatabaseService.read();
    
    const adminsToSeed = [
      {
        id: "admin-1",
        name: "Tochukwu Ogunaka",
        email: "ogunakatochukwu@gmail.com",
        role: "Studio Owner" as const
      },
      {
        id: "admin-2",
        name: "Alelechi",
        email: "alelechi17@gmail.com",
        role: "Administrator" as const
      }
    ];

    let updated = false;
    if (!db.adminUsers) {
      db.adminUsers = [];
      updated = true;
    }

    const defaultPassHash = await this.hashPassword("MyLove26");

    for (const seed of adminsToSeed) {
      const existingUserIndex = db.adminUsers.findIndex(u => u.email.toLowerCase() === seed.email.toLowerCase());
      if (existingUserIndex === -1) {
        console.log(`[SEED] Creating admin user: ${seed.name} (${seed.email})`);
        db.adminUsers.push({
          id: seed.id,
          name: seed.name,
          email: seed.email,
          passwordHash: defaultPassHash,
          role: seed.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: null,
          tokenVersion: "v1"
        });
        updated = true;
      } else {
        // Ensure accurate roles on seed
        const currentU = db.adminUsers[existingUserIndex];
        if (currentU.role !== seed.role) {
          console.log(`[SEED] Updating role to ${seed.role} for admin user: ${seed.name}`);
          currentU.role = seed.role;
          currentU.updatedAt = new Date().toISOString();
          updated = true;
        }
      }
    }

    if (updated) {
      DatabaseService.write(db);
    }
  }

  // Seeding the admin account compatibility method
  public static async seedAdminAccount(): Promise<{ username: string; rawPass: string }> {
    await this.seedAdminAccounts();
    return { username: "ogunakatochukwu@gmail.com", rawPass: "MyLove26" };
  }

  // Express middleware to protect write operations
  public static middleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Private system authorization token is missing.",
        error: "Access denied. Private system authorization token is missing."
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = AuthService.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Access token has expired or is invalid.",
        error: "Access token has expired or is invalid."
      });
    }

    req.adminUser = decoded;
    next();
  }
}
