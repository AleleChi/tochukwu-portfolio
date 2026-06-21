import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { createServer as createViteServer } from "vite";
import { DatabaseService, DatabaseSchema, ArticleSchema, initializeDatabase } from "./server/db";
import { AuthService, AuthenticatedRequest } from "./server/auth";
import { EmailService } from "./server/email";

function getCloudinaryPublicId(url: string): string | null {
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  const subParts = parts[1].split("/");
  if (subParts[0].match(/^v\d+$/)) {
    subParts.shift();
  }
  const fullPath = subParts.join("/");
  const dotIndex = fullPath.lastIndexOf(".");
  return dotIndex !== -1 ? fullPath.substring(0, dotIndex) : fullPath;
}

const app = express();
const PORT = 3000;

// Enable JSON parser & URL-encoded systems with secure payload limits
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Standardize all response payloads for consistency and compatibility
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (body && typeof body === "object") {
      if (body.success === true) {
        if (body.data === undefined) {
          body.data = {};
        }
      } else if (body.success === false) {
        const errMsg = body.message || body.error || "An unexpected error occurred.";
        body.message = errMsg;
        body.error = errMsg;
      }
    }
    return originalJson.call(this, body);
  };
  next();
});

// Paths
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically at /uploads
app.use("/uploads", express.static(uploadsDir));

// --- SIMPLE RATE LIMITING ENGINE (Phase 6) ---
interface RateLimitBucket {
  count: number;
  resetTime: number;
}
const ipRateLimits = new Map<string, RateLimitBucket>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_SUBMISSIONS_PER_WINDOW = 3; // Limit to 3 message submissions per min

const contactRateLimitMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = req.ip || req.headers["x-forwarded-for"] as string || "unknown-client";
  const now = Date.now();
  
  let bucket = ipRateLimits.get(ip);
  if (!bucket || now > bucket.resetTime) {
    bucket = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  }
  
  if (bucket.count >= MAX_SUBMISSIONS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      error: "Too many inquiries submitted. Please pause for 60 seconds before sending another message."
    });
  }
  
  bucket.count++;
  ipRateLimits.set(ip, bucket);
  next();
};

const loginIpRateLimits = new Map<string, RateLimitBucket>();
const LOGIN_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_LOGIN_ATTEMPTS = 5;

const loginRateLimitMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = req.ip || req.headers["x-forwarded-for"] as string || "unknown-client";
  const now = Date.now();
  
  let bucket = loginIpRateLimits.get(ip);
  if (!bucket || now > bucket.resetTime) {
    bucket = { count: 0, resetTime: now + LOGIN_RATE_LIMIT_WINDOW };
  }
  
  if (bucket.count >= MAX_LOGIN_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      error: "Too many login attempts. Please wait 60 seconds before trying again."
    });
  }
  
  bucket.count++;
  loginIpRateLimits.set(ip, bucket);
  next();
};

// --- MULTER STORAGE ENGINE (Hardened memory storage) ---
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit uploads to 5MB maximum
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/i;
    const mimeTypeCheck = allowedTypes.test(file.mimetype);
    const extCheck = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimeTypeCheck && extCheck) {
      cb(null, true);
    } else {
      cb(new Error("File rejection: Only standard image structures are allowed (.jpg, .jpeg, .png, .webp)"));
    }
  },
});

// ==========================================
// API ENDPOINTS
// ==========================================

// --- AUTHENTICATION ROUTES (Phase 3) ---

app.post("/api/auth/login", loginRateLimitMiddleware, async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const loginIdentifier = (email || username || "").trim().toLowerCase();
    
    if (!loginIdentifier || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required fields" });
    }
    
    const db = DatabaseService.read();
    if (!db.adminUsers || db.adminUsers.length === 0) {
      return res.status(500).json({ success: false, error: "Authentication database has not been initialized" });
    }
    
    // Find the admin user with matching email address
    const adminUser = db.adminUsers.find(u => u.email.toLowerCase() === loginIdentifier);
    if (!adminUser) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }
    
    const isValid = await AuthService.comparePassword(password, adminUser.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }
    
    // Update lastLogin timestamp
    adminUser.lastLogin = new Date().toISOString();
    DatabaseService.write(db);
    
    const token = AuthService.createToken({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      tokenVersion: adminUser.tokenVersion
    });

    res.json({
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
    res.status(500).json({ success: false, error: err.message || "Failed administrative challenge" });
  }
});

app.post("/api/auth/verify", (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(400).json({ success: false, error: "Verification token required" });
  }
  
  const decoded = AuthService.verifyToken(token);
  if (decoded) {
    res.json({ 
      success: true, 
      username: decoded.email, 
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      user: decoded
    });
  } else {
    res.status(401).json({ success: false, error: "Token signature expired or broken" });
  }
});

// Update logged-in admin's profile name and email
app.post("/api/admin/update-profile", AuthService.middleware, (req: AuthenticatedRequest, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: "Name and email are required fields" });
    }

    const decoded = req.adminUser;
    if (!decoded) {
      return res.status(410).json({ success: false, error: "Unauthorized session context" });
    }

    const db = DatabaseService.read();
    const adminUser = db.adminUsers?.find(u => u.id === decoded.id);
    if (!adminUser) {
      return res.status(404).json({ success: false, error: "Admin account not found" });
    }

    // Check if email is already taken by another admin user
    if (email.toLowerCase() !== adminUser.email.toLowerCase()) {
      const emailExists = db.adminUsers?.some(u => u.id !== decoded.id && u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        return res.status(400).json({ success: false, error: "Email address is already in use by another administrator." });
      }
    }

    adminUser.name = name;
    adminUser.email = email;
    adminUser.updatedAt = new Date().toISOString();

    DatabaseService.write(db);

    // Issue a fresh token with updated details
    const token = AuthService.createToken({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      tokenVersion: adminUser.tokenVersion
    });

    res.json({
      success: true,
      message: "Admin profile updated successfully.",
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed updating admin profile" });
  }
});

// Change logged-in admin's password with current verification
app.post("/api/admin/change-password", AuthService.middleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, error: "All password fields are required (Current, New, Confirm)." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: "New password and confirmation password do not match." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "New password must be at least 6 characters long." });
    }

    const decoded = req.adminUser;
    if (!decoded) {
      return res.status(401).json({ success: false, error: "Unauthorized session context" });
    }

    const db = DatabaseService.read();
    const adminUser = db.adminUsers?.find(u => u.id === decoded.id);
    if (!adminUser) {
      return res.status(404).json({ success: false, error: "Admin account not found" });
    }

    // Verify current password
    const isCurrentValid = await AuthService.comparePassword(currentPassword, adminUser.passwordHash);
    if (!isCurrentValid) {
      return res.status(400).json({ success: false, error: "Current password verification failed." });
    }

    // Hash and save new password
    adminUser.passwordHash = await AuthService.hashPassword(newPassword);
    
    // Cycle token version to invalidate ALL other active sessions of this user
    adminUser.tokenVersion = "v_" + Date.now();
    adminUser.updatedAt = new Date().toISOString();

    DatabaseService.write(db);

    // Issue a fresh token
    const token = AuthService.createToken({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      tokenVersion: adminUser.tokenVersion
    });

    res.json({
      success: true,
      message: "Password changed successfully. All other active sessions have been signed out.",
      token
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed changing password" });
  }
});

// Invalidate/Logout active sessions for logged-in admin
app.post("/api/admin/logout-sessions", AuthService.middleware, (req: AuthenticatedRequest, res) => {
  try {
    const decoded = req.adminUser;
    if (!decoded) {
      return res.status(401).json({ success: false, error: "Unauthorized session context" });
    }

    const db = DatabaseService.read();
    const adminUser = db.adminUsers?.find(u => u.id === decoded.id);
    if (!adminUser) {
      return res.status(404).json({ success: false, error: "Admin account not found" });
    }

    // Changing the tokenVersion will make existing tokens with older tokenVersion fail validation
    adminUser.tokenVersion = "v_" + Date.now();
    adminUser.updatedAt = new Date().toISOString();

    DatabaseService.write(db);

    res.json({
      success: true,
      message: "All sessions successfully invalidated and logged out."
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed invalidating sessions" });
  }
});

// Retrieve Cloudinary configurations (with fallback defaults)
app.get("/api/admin/cloudinary-config", AuthService.middleware, (req, res) => {
  try {
    const db = DatabaseService.read();
    res.json({
      success: true,
      data: db.cloudinaryConfig || { cloudName: "", apiKey: "", apiSecret: "", provider: "cloudinary" }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save Cloudinary configurations safely with schema reconciliation
app.post("/api/admin/cloudinary-config", AuthService.middleware, (req, res) => {
  try {
    const { cloudName, apiKey, apiSecret, provider } = req.body;
    
    if (!cloudName || !cloudName.trim()) {
      return res.status(400).json({ success: false, error: "Cloudinary cloud name is required." });
    }
    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({ success: false, error: "Cloudinary API key is required." });
    }
    if (!apiSecret || !apiSecret.trim()) {
      return res.status(400).json({ success: false, error: "Cloudinary API secret is required." });
    }

    const db = DatabaseService.read();
    db.cloudinaryConfig = {
      cloudName: cloudName.trim(),
      apiKey: apiKey.trim(),
      apiSecret: apiSecret.trim(),
      provider: provider || "cloudinary"
    };
    DatabaseService.write(db);
    res.json({
      success: true,
      message: "Storage credentials synchronized successfully.",
      data: db.cloudinaryConfig
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create a new administrative operator session user
app.post("/api/admin/users", AuthService.middleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, email, role, password } = req.body;
    if (!name || !email || !role || !password) {
      return res.status(400).json({ success: false, error: "All fields are required (Name, Email, Role, Password)" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters long." });
    }

    if (!["Studio Owner", "Administrator"].includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role selected. Role must be Studio Owner or Administrator." });
    }

    const db = DatabaseService.read();
    const emailExists = db.adminUsers?.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return res.status(400).json({ success: false, error: "Email address is already registered as an administrator." });
    }

    const passwordHash = await AuthService.hashPassword(password);
    const newAdmin = {
      id: "admin-" + Date.now(),
      name,
      email: email.trim().toLowerCase(),
      role,
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      tokenVersion: "v1"
    };

    if (!db.adminUsers) db.adminUsers = [];
    db.adminUsers.push(newAdmin);
    DatabaseService.write(db);

    const { passwordHash: _, ...sanitized } = newAdmin;
    res.json({
      success: true,
      message: "New administrative operator has been registered successfully.",
      user: sanitized
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to create administrator user." });
  }
});

// Delete admin user from cockpit access
app.delete("/api/admin/users/:id", AuthService.middleware, (req: AuthenticatedRequest, res) => {
  try {
    const deleteId = req.params.id;
    const currentAdmin = req.adminUser;

    if (!currentAdmin) {
      return res.status(401).json({ success: false, error: "Unauthorized session context" });
    }

    if (currentAdmin.id === deleteId) {
      return res.status(400).json({ success: false, error: "Conflict error: You are not permitted to self-delete from active administrative users." });
    }

    const db = DatabaseService.read();
    const index = db.adminUsers.findIndex(u => u.id === deleteId);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Operator not found in target database." });
    }

    db.adminUsers.splice(index, 1);
    DatabaseService.write(db);

    res.json({
      success: true,
      message: "Operator has been striped of cockpit administrative privileges."
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to revoke administrator privileges." });
  }
});

// --- PUBLIC DATA OUTFLOW ENDPOINTS (Phase 4 — Display only published data) ---

app.get("/api/profile", (req, res) => {
  try {
    const data = DatabaseService.getProfile();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed getting profile metadata", error: "Failed getting profile metadata" });
  }
});

app.get("/api/hero", (req, res) => {
  try {
    const data = DatabaseService.getHero();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed getting hero module", error: "Failed getting hero module" });
  }
});

app.get("/api/practice", (req, res) => {
  try {
    const db = DatabaseService.read();
    res.json({ success: true, data: db.practice || {} });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed retrieving practice areas", error: "Failed retrieving practice areas" });
  }
});

app.get("/api/experience", (req, res) => {
  try {
    // PUBLIC: Displays only published records (Phase 4)
    const data = DatabaseService.getExperiences(false);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed retrieving experience history", error: "Failed retrieving experience history" });
  }
});

app.get("/api/speaking", (req, res) => {
  try {
    const data = DatabaseService.getSpeaking();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed retrieving speaking metadata", error: "Failed retrieving speaking metadata" });
  }
});

app.get("/api/archive", (req, res) => {
  try {
    // PUBLIC: Displays only published gallery media (Phase 4)
    const data = DatabaseService.getGallery(false);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed retrieving gallery archive", error: "Failed retrieving gallery archive" });
  }
});

app.get("/api/gallery", (req, res) => {
  try {
    // PUBLIC: Displays only published gallery media (Phase 4)
    const data = DatabaseService.getGallery(false);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed retrieving gallery archive", error: "Failed retrieving gallery archive" });
  }
});

app.get("/api/recognition", (req, res) => {
  try {
    const r = DatabaseService.getRecognition();
    // Verify publish state
    if (r.status === "published" || !r.status) {
      res.json({ success: true, data: r });
    } else {
      res.json({ success: true, data: {} });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed retrieving recognition", error: "Failed retrieving recognition" });
  }
});

app.get("/api/credentials", (req, res) => {
  try {
    const db = DatabaseService.read();
    res.json({
      success: true,
      data: {
        certifications: db.certifications || [],
        education: db.education || {}
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed retrieving credentials", error: "Failed retrieving credentials" });
  }
});

app.get("/api/articles", (req, res) => {
  try {
    // If Admin token is provided or explicit query includeDrafts=true, retrieve all articles
    const includeDrafts = req.query.includeDrafts === "true" || !!req.headers.authorization;
    const data = DatabaseService.getArticles(includeDrafts);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed retrieving thoughts catalog", error: "Failed retrieving thoughts catalog" });
  }
});

app.post("/api/articles", AuthService.middleware, (req, res) => {
  console.log("ARTICLE SAVE START");
  
  const {
    title,
    category,
    readTime,
    subtitle,
    content,
    imageUrl,
    cloudinaryId,
    status,
    sections,
    description
  } = req.body;

  console.log("Incoming payload:", {
    title: title || "",
    category: category || "",
    contentLength: content ? content.length : (description ? description.length : 0),
    imageUrl: imageUrl || ""
  });

  // Strict Field-by-Field manual validation for precise errors
  if (!title) {
    return res.status(400).json({ success: false, error: "Article save failed: title field missing" });
  }
  if (title.length < 3) {
    return res.status(400).json({ success: false, error: "Article save failed: title must be at least 3 characters long" });
  }
  if (!category) {
    return res.status(400).json({ success: false, error: "Article save failed: category field missing" });
  }
  if (!content && !description) {
    return res.status(400).json({ success: false, error: "Article save failed: content field missing" });
  }

  try {
    const db = DatabaseService.read();
    if (!db.articles) db.articles = [];

    const newId = Date.now().toString();
    const finalContent = content || description || "";
    
    const newArticle = {
      id: newId,
      title,
      category,
      readTime: readTime || "5 Min Read",
      readingTime: readTime || "5 Min Read",
      subtitle: subtitle || "",
      content: finalContent,
      description: finalContent,
      body: finalContent,
      sections: sections || [{ heading: "", text: finalContent }],
      imageUrl: imageUrl || "/input_file_0.png",
      cloudinaryId: cloudinaryId || "",
      status: status || "published",
      date: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Safe parse via ArticleSchema
    const parsedResult = ArticleSchema.safeParse(newArticle);
    if (!parsedResult.success) {
      const firstIssue = parsedResult.error.issues[0];
      return res.status(400).json({
        success: false,
        error: `Article save failed: ${firstIssue.path.join(".") || "validation failure"} - ${firstIssue.message}`
      });
    }

    db.articles.push(parsedResult.data);
    const saved = DatabaseService.write(db);
    if (!saved) {
      return res.status(500).json({ success: false, error: "Filesystem failure saving changes" });
    }

    console.log("DATABASE UPDATE SUCCESS");

    res.json({
      success: true,
      message: "Article successfully created",
      data: parsedResult.data
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed saving article" });
  }
});

app.put("/api/articles/:id", AuthService.middleware, (req, res) => {
  console.log("ARTICLE SAVE START");
  
  const articleId = req.params.id;
  const {
    title,
    category,
    readTime,
    subtitle,
    content,
    imageUrl,
    cloudinaryId,
    status,
    sections,
    description
  } = req.body;

  console.log("Incoming payload:", {
    title: title || "",
    category: category || "",
    contentLength: content ? content.length : (description ? description.length : 0),
    imageUrl: imageUrl || ""
  });

  // Strict Field-by-Field validation for precise errors
  if (!title) {
    return res.status(400).json({ success: false, error: "Article save failed: title field missing" });
  }
  if (title.length < 3) {
    return res.status(400).json({ success: false, error: "Article save failed: title must be at least 3 characters long" });
  }
  if (!category) {
    return res.status(400).json({ success: false, error: "Article save failed: category field missing" });
  }
  if (!content && !description) {
    return res.status(400).json({ success: false, error: "Article save failed: content field missing" });
  }

  try {
    const db = DatabaseService.read();
    if (!db.articles) db.articles = [];

    const index = db.articles.findIndex(art => String(art.id) === String(articleId));
    if (index === -1) {
      return res.status(404).json({ success: false, error: `Article save failed: article with id ${articleId} not found` });
    }

    const existing = db.articles[index];
    const finalContent = content || description || "";

    const updatedArticle = {
      ...existing,
      title,
      category,
      readTime: readTime || existing.readTime || "5 Min Read",
      readingTime: readTime || existing.readTime || "5 Min Read",
      subtitle: subtitle || "",
      content: finalContent,
      description: finalContent,
      body: finalContent,
      sections: sections || existing.sections || [{ heading: "", text: finalContent }],
      imageUrl: imageUrl || existing.imageUrl || "/input_file_0.png",
      cloudinaryId: cloudinaryId !== undefined ? cloudinaryId : existing.cloudinaryId,
      status: status || existing.status || "published",
      updatedAt: new Date().toISOString()
    };

    // Safe parse via ArticleSchema
    const parsedResult = ArticleSchema.safeParse(updatedArticle);
    if (!parsedResult.success) {
      const firstIssue = parsedResult.error.issues[0];
      return res.status(400).json({
        success: false,
        error: `Article save failed: ${firstIssue.path.join(".") || "validation failure"} - ${firstIssue.message}`
      });
    }

    db.articles[index] = parsedResult.data;
    const saved = DatabaseService.write(db);
    if (!saved) {
      return res.status(500).json({ success: false, error: "Filesystem failure saving changes" });
    }

    console.log("DATABASE UPDATE SUCCESS");

    res.json({
      success: true,
      message: "Article successfully updated",
      data: parsedResult.data
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed saving article" });
  }
});

app.delete("/api/articles/:id", AuthService.middleware, (req, res) => {
  const articleId = req.params.id;
  try {
    const db = DatabaseService.read();
    if (!db.articles) db.articles = [];

    const index = db.articles.findIndex(art => String(art.id) === String(articleId));
    if (index === -1) {
      return res.status(404).json({ success: false, error: `Article not found` });
    }

    db.articles.splice(index, 1);
    const saved = DatabaseService.write(db);
    if (!saved) {
      return res.status(500).json({ success: false, error: "Filesystem failure saving changes" });
    }

    res.json({ success: true, message: "Article successfully deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed deleting article" });
  }
});

app.get("/api/testimonials", (req, res) => {
  try {
    const data = DatabaseService.getTestimonials();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed retrieving endorsements" });
  }
});

app.get("/api/organisations", (req, res) => {
  try {
    const db = DatabaseService.read();
    res.json({ success: true, data: db.organisations || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed retrieving organisations" });
  }
});

app.get("/api/selected-work", (req, res) => {
  try {
    const db = DatabaseService.read();
    res.json({ success: true, data: db.selectedWork || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed retrieving selected projects" });
  }
});

// --- PUBLIC CONTACT SUBMISSION (Phase 6 - Rate Protected) ---

app.post("/api/contact-submit", contactRateLimitMiddleware, async (req, res) => {
  try {
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

    const payload = DatabaseService.addContactSubmission({
      name,
      email,
      subject: subject || "General Inquiry",
      message,
      organization: organization || null,
      category: category || null
    });

    // Send immediate email notification to matching admins (Step 2)
    // Run asynchronously / try-catch so it doesn't block client response
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

    res.json({
      success: true,
      message: "Your message has been received and stored in Tochukwu's secure administrative log.",
      data: payload
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "An error occurred writing your submission.", error: err.message || "An error occurred writing your submission." });
  }
});

// Update single Message Status - Mark read / archive
app.post(["/api/admin/messages/:id/status", "/api/messages/:id/status"], AuthService.middleware, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid submission identifier" });
    }
    if (!["New", "Read", "Archived", "Replied"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid state status classification" });
    }

    const updated = DatabaseService.updateContactSubmissionStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Message record target not found" });
    }

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "An error occurred processing status mutation" });
  }
});

// Send clean professional reply correspondence to message log contact
app.post(["/api/admin/messages/:id/reply", "/api/messages/:id/reply"], AuthService.middleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { subject, message } = req.body;
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid submission identifier" });
    }
    if (!subject || !message) {
      return res.status(400).json({ success: false, error: "Reply subject and message body are required" });
    }

    const submissions = DatabaseService.getContactSubmissions();
    const submission = submissions.find(s => s.id === id);
    if (!submission) {
      return res.status(404).json({ success: false, error: "Message record target not found" });
    }

    // Dispatch direct professional email response
    const emailResult = await EmailService.sendResponseReply(submission.name, submission.email, subject, message);
    if (!emailResult.success) {
      return res.status(500).json({ success: false, error: emailResult.error || "SMTP service failed sending reply" });
    }

    // Persist reply details inside database records
    const updated = DatabaseService.addSubmissionReply(id, {
      recipient: submission.email,
      subject,
      message
    });

    res.json({ success: true, message: "Reply sent and logged successfully", data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "An error occurred processing the mail reply" });
  }
});

// Delete single Message Log
app.delete(["/api/admin/messages/:id", "/api/messages/:id"], AuthService.middleware, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid submission identifier" });
    }

    DatabaseService.deleteContactSubmission(id);
    res.json({ success: true, message: "Enquiry log physically purged from directory" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed removing record from file system database" });
  }
});


// ==========================================
// PROTECTED ADMINISTRATIVE ROUTING PANEL
// ==========================================

// Return RAW unfiltered database to Admin Dashboard (including drafts & submissions)
app.get("/api/all-content", AuthService.middleware, (req, res) => {
  try {
    const db = DatabaseService.read();
    // Clone and sanitize adminUsers to never expose password hashes
    const sanitizedAdminUsers = (db.adminUsers || []).map(({ passwordHash, ...rest }) => rest);
    const sanitizedDb = { ...db, adminUsers: sanitizedAdminUsers };
    res.json({ success: true, data: sanitizedDb });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed extracting central content catalog" });
  }
});

// Helper to normalize, validate with detailed telemetry, and write database
async function validateAndWriteDb(db: any, res: any, isPartialImageUpdate: boolean = false) {
  try {
    const normalizedDb = DatabaseService.normalize(db);
    
    // Zod Safe Validation Match
    const parsed = DatabaseSchema.safeParse(normalizedDb);
    
    if (!parsed.success) {
      console.error("\n--- [VALIDATION WARNING/ERROR DETAILS] ---");
      const warnings: string[] = [];
      const failedFields: string[] = [];
      parsed.error.issues.forEach((issue) => {
        const pathSegments = issue.path;
        // Construct standard dot / index notation path, e.g. certifications[0].year
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

      // Write to database even if validation has warnings - explicitly required
      const saved = await DatabaseService.writeAsync(normalizedDb);
      if (!saved) {
        return res.status(500).json({ success: false, error: "Filesystem failure saving changes" });
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

    // Fully valid path
    const saved = await DatabaseService.writeAsync(normalizedDb);
    if (!saved) {
      return res.status(500).json({ success: false, error: "Filesystem failure saving changes" });
    }

    return res.json({
      success: true,
      message: "Database updated and synchronized successfully! Checksum solid.",
      data: normalizedDb
    });

  } catch (err: any) {
    console.error("[VALIDATION & WRITE ERROR]", err);
    return res.status(500).json({ success: false, error: err.message || "An unexpected error occurred during save." });
  }
}

// Dedicated partial image update endpoints
app.put("/api/profile/image/:slot?", AuthService.middleware, async (req, res) => {
  const imageUrl = req.body.imageUrl || req.body.url;
  if (!imageUrl) {
    return res.status(400).json({ success: false, error: "Please provide a valid image URL." });
  }

  const db = DatabaseService.read();
  if (!db.profile) db.profile = {} as any;
  db.profile.profileImage = imageUrl;
  db.profile.updatedAt = new Date().toISOString();

  return await validateAndWriteDb(db, res, true);
});

app.put("/api/hero/image", AuthService.middleware, async (req, res) => {
  const imageUrl = req.body.imageUrl || req.body.url;
  if (!imageUrl) {
    return res.status(400).json({ success: false, error: "Please provide a valid image URL." });
  }

  const db = DatabaseService.read();
  if (!db.hero) db.hero = {} as any;
  db.hero.heroImage = imageUrl;
  db.hero.updatedAt = new Date().toISOString();

  return await validateAndWriteDb(db, res, true);
});

app.put("/api/hero/persona/image/:id", AuthService.middleware, async (req, res) => {
  const idValue = parseInt(req.params.id, 10);
  const imageUrl = req.body.imageUrl || req.body.url;
  if (!imageUrl) {
    return res.status(400).json({ success: false, error: "Please provide a valid image URL." });
  }

  const db = DatabaseService.read();
  let updatedSuccessfully = false;
  let matchedIndex = -1;
  if (db.hero && Array.isArray(db.hero.personas)) {
    db.hero.personas = db.hero.personas.map((p: any, index: number) => {
      if (p.id === idValue) {
        updatedSuccessfully = true;
        matchedIndex = index;
        return { ...p, filePath: imageUrl };
      }
      return p;
    });
    db.hero.updatedAt = new Date().toISOString();
  }

  if (!updatedSuccessfully) {
    return res.status(404).json({
      success: false,
      error: `Image uploaded, but database update failed: hero persona with ID ${idValue} was not found.`,
      field: `hero.personas[${idValue}].filePath`
    });
  }

  return await validateAndWriteDb(db, res, true);
});

app.put("/api/speaking/image/:slot", AuthService.middleware, async (req, res) => {
  const slot = req.params.slot;
  const imageUrl = req.body.imageUrl || req.body.url;
  if (!imageUrl) {
    return res.status(400).json({ success: false, error: "Please provide a valid image URL." });
  }

  const db = DatabaseService.read();
  if (!db.speaking) {
    db.speaking = {
      title: "Speaking & Leadership Engagement",
      description: "Dialogue contribution insights...",
      blocks: [],
      image1: imageUrl,
      image2: "/input_file_2.png"
    } as any;
  } else {
    if (slot === "1" || slot === "image1") {
      db.speaking.image1 = imageUrl;
    } else {
      db.speaking.image2 = imageUrl;
    }
    db.speaking.updatedAt = new Date().toISOString();
  }

  return await validateAndWriteDb(db, res, true);
});

app.put("/api/recognition/image", AuthService.middleware, async (req, res) => {
  const imageUrl = req.body.imageUrl || req.body.url;
  if (!imageUrl) {
    return res.status(400).json({ success: false, error: "Please provide a valid image URL." });
  }

  const db = DatabaseService.read();
  if (!db.recognition) db.recognition = {} as any;
  db.recognition.image = imageUrl;
  db.recognition.updatedAt = new Date().toISOString();

  return await validateAndWriteDb(db, res, true);
});

app.put("/api/gallery/image/:id", AuthService.middleware, async (req, res) => {
  const idValue = req.params.id;
  const imageUrl = req.body.imageUrl || req.body.url;
  if (!imageUrl) {
    return res.status(400).json({ success: false, error: "Please provide a valid image URL." });
  }

  const db = DatabaseService.read();
  let updatedSuccessfully = false;
  let matchedIndex = -1;
  if (Array.isArray(db.gallery)) {
    db.gallery = db.gallery.map((g: any, index: number) => {
      if (String(g.id) === String(idValue)) {
        updatedSuccessfully = true;
        matchedIndex = index;
        return { ...g, imageUrl, updatedAt: new Date().toISOString() };
      }
      return g;
    });
  }

  if (!updatedSuccessfully) {
    return res.status(404).json({
      success: false,
      error: `Image uploaded, but database update failed: visualStories[${idValue}].image`,
      field: `visualStories[${idValue}].image`
    });
  }

  return await validateAndWriteDb(db, res, true);
});

app.put("/api/articles/image/:id", AuthService.middleware, async (req, res) => {
  const idValue = req.params.id;
  const imageUrl = req.body.imageUrl || req.body.url;
  if (!imageUrl) {
    return res.status(400).json({ success: false, error: "Please provide a valid image URL." });
  }

  const db = DatabaseService.read();
  let updatedSuccessfully = false;
  let matchedIndex = -1;
  if (Array.isArray(db.articles)) {
    db.articles = db.articles.map((art: any, index: number) => {
      if (String(art.id) === String(idValue)) {
        updatedSuccessfully = true;
        matchedIndex = index;
        return { ...art, imageUrl, updatedAt: new Date().toISOString() };
      }
      return art;
    });
  }

  if (!updatedSuccessfully) {
    return res.status(404).json({
      success: false,
      error: `Image uploaded, but database update failed: articles[${idValue}].imageUrl`,
      field: `articles[${idValue}].imageUrl`
    });
  }

  return await validateAndWriteDb(db, res, true);
});

// Generic partial image update endpoint for single replacement actions
app.put("/api/profile/image-update", AuthService.middleware, async (req, res) => {
  const { field, imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ success: false, error: "Please provide a valid image URL." });
  }

  const db = DatabaseService.read();
  let updatedSuccessfully = true;
  let errorField = field;

  if (field === "profile" || field === "profile.profileImage" || field === "profileImage") {
    if (!db.profile) db.profile = {} as any;
    db.profile.profileImage = imageUrl;
    db.profile.updatedAt = new Date().toISOString();
  } else if (field === "hero" || field === "hero.heroImage" || field === "heroImage") {
    if (!db.hero) db.hero = {} as any;
    db.hero.heroImage = imageUrl;
    db.hero.updatedAt = new Date().toISOString();
  } else if (field.startsWith("persona") || field.startsWith("hero.persona")) {
    const match = field.match(/\d+/);
    if (match) {
      const idx = parseInt(match[0], 10);
      let found = false;
      if (db.hero && Array.isArray(db.hero.personas)) {
        db.hero.personas = db.hero.personas.map((p: any, i: number) => {
          if (p.id === idx || i === idx) {
            found = true;
            return { ...p, filePath: imageUrl };
          }
          return p;
        });
        db.hero.updatedAt = new Date().toISOString();
      }
      if (!found) {
        updatedSuccessfully = false;
        errorField = `hero.personas[${idx}].filePath`;
      }
    } else {
      updatedSuccessfully = false;
    }
  } else if (field === "recognition" || field === "recognition.image" || field === "recognitionImage") {
    if (!db.recognition) db.recognition = {} as any;
    db.recognition.image = imageUrl;
    db.recognition.updatedAt = new Date().toISOString();
  } else if (field === "speaking.image1" || field === "speaking-image1") {
    if (db.speaking) {
      db.speaking.image1 = imageUrl;
      db.speaking.updatedAt = new Date().toISOString();
    } else {
      updatedSuccessfully = false;
    }
  } else if (field === "speaking.image2" || field === "speaking-image2") {
    if (db.speaking) {
      db.speaking.image2 = imageUrl;
      db.speaking.updatedAt = new Date().toISOString();
    } else {
      updatedSuccessfully = false;
    }
  } else if (field.startsWith("gallery") || field.startsWith("gallery-item")) {
    const match = field.match(/\d+/);
    if (match) {
      const idx = parseInt(match[0], 10);
      let found = false;
      if (Array.isArray(db.gallery)) {
        db.gallery = db.gallery.map((g: any, i: number) => {
          if (String(g.id) === String(idx) || i === idx) {
            found = true;
            return { ...g, imageUrl, updatedAt: new Date().toISOString() };
          }
          return g;
        });
      }
      if (!found) {
        updatedSuccessfully = false;
        errorField = `visualStories[${idx}].image`;
      }
    } else {
      updatedSuccessfully = false;
    }
  } else if (field.startsWith("article") || field.startsWith("articles")) {
    const match = field.match(/\d+/);
    if (match) {
      const idx = parseInt(match[0], 10);
      let found = false;
      if (Array.isArray(db.articles)) {
        db.articles = db.articles.map((art: any, i: number) => {
          if (String(art.id) === String(idx) || i === idx) {
            found = true;
            return { ...art, imageUrl, updatedAt: new Date().toISOString() };
          }
          return art;
        });
      }
      if (!found) {
        updatedSuccessfully = false;
        errorField = `articles[${idx}].imageUrl`;
      }
    } else {
      updatedSuccessfully = false;
    }
  } else {
    updatedSuccessfully = false;
  }

  if (!updatedSuccessfully) {
    return res.status(404).json({
      success: false,
      error: `Image uploaded, but database update failed: ${errorField}`,
      field: errorField
    });
  }

  return await validateAndWriteDb(db, res, true);
});

// Hardened Save-All Interface with schema validations (Phase 1, 3 & 4)
app.post("/api/save-all", AuthService.middleware, async (req, res) => {
  try {
    const bodyArgs = req.body;
    if (!bodyArgs || typeof bodyArgs !== "object") {
      return res.status(400).json({ success: false, error: "Saved information must be a valid JSON map" });
    }

    const db = DatabaseService.read();

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

    return await validateAndWriteDb(db, res);
  } catch (err: any) {
    console.error("[SAVE-ALL ERROR DETAIL]", err);
    res.status(400).json({
      success: false,
      error: `Unable to save changes. Please check the required fields: ${err.issues ? JSON.stringify(err.issues) : err.message || String(err)}`
    });
  }
});

// --- MEDIA LIBRARY CONTROLLER SERVICES (Phase 2 & 3) ---

// Retreive library image catalog
app.get("/api/media", AuthService.middleware, (req, res) => {
  try {
    const list = DatabaseService.getMedia();
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// New upload processing system which validates, optimizes, and uploads to Cloudinary or disk fallback
app.post("/api/upload", AuthService.middleware, upload.single("image"), async (req, res) => {
  console.log("--- [UPLOAD START] ---");
  let savedFilePath: string | null = null;
  let addedMediaId: string | null = null;
  let cloudinaryPublicIdToRemove: string | null = null;

  try {
    if (!req.file) {
      console.warn("Upload aborted: No image structure attached in request.");
      return res.status(400).json({ success: false, error: "Please attach an image structure" });
    }

    const file = req.file;
    console.log(`[FILE RECEIVED] Name: "${file.originalname}", Format Mime: "${file.mimetype}", Size: ${file.size} bytes`);

    // Check if the exact media already exists in the catalog to prevent duplicates
    const dbInst = DatabaseService.read();
    if (!dbInst.media) dbInst.media = [];
    const existingMedia = dbInst.media.find((m: any) => 
      m.originalFilename === file.originalname && 
      m.fileSize === file.size
    );

    if (existingMedia) {
      console.log(`[DUPLICATE DETECTED] Reusing existing media record: "${existingMedia.url}"`);
      const finalUrl = existingMedia.url;
      const category = (req.body.category || req.body.type || "other") as any;

      // Update ONLY the target field on the database in a resilient manner
      try {
        console.log(`--- [DATABASE UPDATE DUPLICATE] Updating field for category: "${category}" ---`);
        if (category === "hero" && dbInst.hero) {
          dbInst.hero.heroImage = finalUrl;
          dbInst.hero.updatedAt = new Date().toISOString();
          DatabaseService.write(dbInst);
        } else if (category === "profile" && dbInst.profile) {
          dbInst.profile.profileImage = finalUrl;
          dbInst.profile.updatedAt = new Date().toISOString();
          DatabaseService.write(dbInst);
        } else if (category === "persona" && req.body.id !== undefined) {
          const personaId = parseInt(req.body.id, 10);
          if (dbInst.hero && Array.isArray(dbInst.hero.personas)) {
            dbInst.hero.personas = dbInst.hero.personas.map((p: any) => 
              p.id === personaId ? { ...p, filePath: finalUrl } : p
            );
            dbInst.hero.updatedAt = new Date().toISOString();
            DatabaseService.write(dbInst);
          }
        } else if (category === "recognition" && dbInst.recognition) {
          dbInst.recognition.image = finalUrl;
          dbInst.recognition.updatedAt = new Date().toISOString();
          DatabaseService.write(dbInst);
        } else if (category === "speaking-image1" || (category === "speaking" && (req.body.id === "1" || req.body.id === 1))) {
          if (dbInst.speaking) {
            dbInst.speaking.image1 = finalUrl;
            dbInst.speaking.updatedAt = new Date().toISOString();
            DatabaseService.write(dbInst);
          }
        } else if (category === "speaking-image2" || (category === "speaking" && (req.body.id === "2" || req.body.id === 2))) {
          if (dbInst.speaking) {
            dbInst.speaking.image2 = finalUrl;
            dbInst.speaking.updatedAt = new Date().toISOString();
            DatabaseService.write(dbInst);
          }
        } else if ((category === "gallery-item" || category === "gallery") && req.body.id !== undefined) {
          const targetIndex = parseInt(req.body.id, 10);
          if (!isNaN(targetIndex) && dbInst.gallery && dbInst.gallery[targetIndex]) {
            dbInst.gallery[targetIndex].imageUrl = finalUrl;
            dbInst.gallery[targetIndex].updatedAt = new Date().toISOString();
            DatabaseService.write(dbInst);
          }
        } else if ((category === "article-image" || category === "articles") && req.body.id !== undefined) {
          const targetIndex = parseInt(req.body.id, 10);
          if (!isNaN(targetIndex) && dbInst.articles && dbInst.articles[targetIndex]) {
            dbInst.articles[targetIndex].imageUrl = finalUrl;
            dbInst.articles[targetIndex].updatedAt = new Date().toISOString();
            DatabaseService.write(dbInst);
          }
        }
      } catch (dbUpdateErr) {
        console.error("[UPLOAD DB SYNC DUPLICATE ERROR]", dbUpdateErr);
      }

      return res.json({
        success: true,
        message: "Duplicate prevented: This image was previously uploaded and is linked successfully.",
        data: existingMedia,
        url: finalUrl,
        publicId: existingMedia.uploadedFilename || existingMedia.filename,
        width: 1600,
        height: 1600,
        format: "webp"
      });
    }

    // 1. Validate file size (Maximum 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.warn("Upload aborted: File exceeds standard 5MB criteria limit.");
      return res.status(400).json({ success: false, error: "Image size exceeds the maximum allowed 5MB." });
    }

    // 2. Validate file extension
    const originalExt = path.extname(file.originalname).toLowerCase();
    const isAllowedExt = [".jpg", ".jpeg", ".png", ".webp"].includes(originalExt);
    if (!isAllowedExt) {
      console.warn(`Upload aborted: File extension "${originalExt}" is not in list of allowed extensions list.`);
      return res.status(400).json({ success: false, error: "Unsupported image format selected. Only JPG, JPEG, PNG, and WEBP formats are accepted." });
    }

    // Inspect signature using sharp metadata to prevent disguised or corrupted files
    let imageProcessor = sharp(file.buffer);
    let metadata;
    try {
      metadata = await imageProcessor.metadata();
    } catch (metadataErr) {
      console.error("Upload aborted: Sharp failed reading metadata from input buffer.", metadataErr);
      return res.status(400).json({ success: false, error: "Invalid or corrupted image file structure." });
    }

    if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format)) {
      console.warn(`Upload aborted: Unsupported internal image signature "${metadata.format}".`);
      return res.status(400).json({ success: false, error: "Unsupported image signature. Only JPG, PNG, and WEBP formats are accepted." });
    }

    // Sanitize base name for safe filenames
    const sanitizedBase = path.basename(file.originalname, originalExt)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .substring(0, 50) || "upload";
    
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const outputFilename = `${sanitizedBase}-${uniqueSuffix}.webp`;

    // 3. Save optimized image (compress, resize oversized width/height > 1600px)
    if ((metadata.width && metadata.width > 1600) || (metadata.height && metadata.height > 1600)) {
      imageProcessor = imageProcessor.resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true
      });
    }

    // Compress to highly optimized WEBP format buffer
    const optimizedBuffer = await imageProcessor
      .webp({ quality: 80 })
      .toBuffer();

    // Check Cloudinary credential configurations, supporting both standard environments and the STORAGE_ convention in .env.example
    const isStorageCloudinary = process.env.STORAGE_PROVIDER === "cloudinary";
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 
                     (isStorageCloudinary ? process.env.STORAGE_BUCKET_NAME : null) || 
                     dbInst.cloudinaryConfig?.cloudName;
    const apiKey = process.env.CLOUDINARY_API_KEY || 
                   (isStorageCloudinary ? process.env.STORAGE_API_KEY : null) || 
                   dbInst.cloudinaryConfig?.apiKey;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 
                     (isStorageCloudinary ? process.env.STORAGE_API_SECRET : null) || 
                     dbInst.cloudinaryConfig?.apiSecret;

    const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret);
    const category = (req.body.category || req.body.type || "other") as any;
    const altText = req.body.altText || `Tochukwu Ogunaka Portfolio: ${file.originalname}`;

    let finalUrl = "";
    let finalFileSize = optimizedBuffer.length;
    let cloudinaryResult: any = null;

    if (isCloudinaryConfigured) {
      // Set directory folders in Cloudinary as requested in Requirement 2
      let folder = "tochukwu/other";
      if (category === "profile") folder = "tochukwu/profile";
      else if (category === "gallery" || category === "gallery-item") folder = "tochukwu/gallery";
      else if (category === "articles" || category === "article-image") folder = "tochukwu/articles";
      else if (category === "recognition") folder = "tochukwu/recognition";
      else if (category === "speaking" || category === "speaking-image1" || category === "speaking-image2") folder = "tochukwu/speaking";
      else if (category === "hero" || category === "persona") folder = "tochukwu/hero";

      console.log(`Cloudinary identified. Target destination directory: "${folder}"`);

      // Upload memory stream buffer to Cloudinary
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
      });

      cloudinaryResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: path.basename(outputFilename, ".webp"),
            resource_type: "image"
          },
          (err, result) => {
            if (err) {
              console.error("Cloudinary uploading error returned:", err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(optimizedBuffer);
      });

      console.log("[CLOUDINARY RESPONSE] Succeeded. Secure URL footprint verified:", cloudinaryResult.secure_url);
      finalUrl = cloudinaryResult.secure_url;
      cloudinaryPublicIdToRemove = cloudinaryResult.public_id;
    } else {
      console.warn("Cloudinary configuration credentials missing. Saving fallback image on disk storage...");
      // Save locally to disks folder
      const targetDiskPath = path.join(uploadsDir, outputFilename);
      fs.writeFileSync(targetDiskPath, optimizedBuffer);
      savedFilePath = targetDiskPath;

      // 4. Confirm file exists on active disk
      if (!fs.existsSync(targetDiskPath)) {
        throw new Error("File output verification failed. System could not confirm file footprint on disk.");
      }
      finalUrl = `/uploads/${outputFilename}`;
      console.log(`[LOCAL FALLBACK SAVE] Footprint stored locally: "${finalUrl}"`);
    }

    // 5. Update database record securely
    // Map fine-grained upload/image categories to schema-eligible database media categories
    let mediaDbCategory = "other";
    if (category === "profile") mediaDbCategory = "profile";
    else if (category === "hero" || category === "persona") mediaDbCategory = "hero";
    else if (category === "experience") mediaDbCategory = "experience";
    else if (category === "speaking" || category === "speaking-image1" || category === "speaking-image2") mediaDbCategory = "speaking";
    else if (category === "gallery" || category === "gallery-item") mediaDbCategory = "gallery";
    else if (category === "recognition") mediaDbCategory = "recognition";
    else if (category === "articles" || category === "article-image") mediaDbCategory = "articles";

    const mediaObj = DatabaseService.addMedia({
      filename: outputFilename,
      url: finalUrl,
      altText,
      category: mediaDbCategory,
      fileSize: finalFileSize,
      originalFilename: file.originalname,
      uploadedFilename: outputFilename
    });

    addedMediaId = mediaObj.id;

    // 5.5 Update ONLY the target field on the database in a resilient manner
    // This implements Phase 5: "update only hero image fields. Do not rewrite unrelated profile sections when changing one image."
    try {
      console.log(`--- [DATABASE UPDATE] Updating field for category: "${category}" ---`);
      if (category === "hero" && dbInst.hero) {
        dbInst.hero.heroImage = finalUrl;
        dbInst.hero.updatedAt = new Date().toISOString();
        DatabaseService.write(dbInst);
      } else if (category === "profile" && dbInst.profile) {
        dbInst.profile.profileImage = finalUrl;
        dbInst.profile.updatedAt = new Date().toISOString();
        DatabaseService.write(dbInst);
      } else if (category === "persona" && req.body.id !== undefined) {
        const personaId = parseInt(req.body.id, 10);
        if (dbInst.hero && Array.isArray(dbInst.hero.personas)) {
          dbInst.hero.personas = dbInst.hero.personas.map((p: any) => 
            p.id === personaId ? { ...p, filePath: finalUrl } : p
          );
          dbInst.hero.updatedAt = new Date().toISOString();
          DatabaseService.write(dbInst);
        }
      } else if (category === "recognition" && dbInst.recognition) {
        dbInst.recognition.image = finalUrl;
        dbInst.recognition.updatedAt = new Date().toISOString();
        DatabaseService.write(dbInst);
      } else if (category === "speaking-image1" || (category === "speaking" && (req.body.id === "1" || req.body.id === 1))) {
        if (dbInst.speaking) {
          dbInst.speaking.image1 = finalUrl;
          dbInst.speaking.updatedAt = new Date().toISOString();
          DatabaseService.write(dbInst);
        }
      } else if (category === "speaking-image2" || (category === "speaking" && (req.body.id === "2" || req.body.id === 2))) {
        if (dbInst.speaking) {
          dbInst.speaking.image2 = finalUrl;
          dbInst.speaking.updatedAt = new Date().toISOString();
          DatabaseService.write(dbInst);
        }
      } else if ((category === "gallery-item" || category === "gallery") && req.body.id !== undefined) {
        const targetIndex = parseInt(req.body.id, 10);
        if (!isNaN(targetIndex) && dbInst.gallery && dbInst.gallery[targetIndex]) {
          dbInst.gallery[targetIndex].imageUrl = finalUrl;
          dbInst.gallery[targetIndex].updatedAt = new Date().toISOString();
          DatabaseService.write(dbInst);
        }
      } else if ((category === "article-image" || category === "articles") && req.body.id !== undefined) {
        const targetIndex = parseInt(req.body.id, 10);
        if (!isNaN(targetIndex) && dbInst.articles && dbInst.articles[targetIndex]) {
          dbInst.articles[targetIndex].imageUrl = finalUrl;
          dbInst.articles[targetIndex].updatedAt = new Date().toISOString();
          DatabaseService.write(dbInst);
        }
      }
    } catch (dbUpdateErr) {
      console.error("[UPLOAD DB SYNC ERROR]", dbUpdateErr);
    }

    console.log(`--- [UPLOAD COMPLETE] Succeeded! Final image URL is: "${finalUrl}" ---`);

    // 6. Return success response format containing all required attributes
    return res.json({
      success: true,
      message: isCloudinaryConfigured 
        ? "Image optimized and synchronized into Cloudinary production storage successfully." 
        : "Image uploaded and optimized safely on local disk structure.",
      data: mediaObj,
      url: finalUrl,
      publicId: isCloudinaryConfigured ? cloudinaryPublicIdToRemove : outputFilename,
      width: isCloudinaryConfigured ? cloudinaryResult?.width : (metadata.width || 0),
      height: isCloudinaryConfigured ? cloudinaryResult?.height : (metadata.height || 0),
      format: isCloudinaryConfigured ? cloudinaryResult?.format : (metadata.format || "webp")
    });

  } catch (err: any) {
    console.error("Upload flow error encountered:", err);

    // Rollback incomplete uploads if any step fails
    if (savedFilePath && fs.existsSync(savedFilePath)) {
      try {
        fs.unlinkSync(savedFilePath);
      } catch (unlinkErr) {
        console.error("Rollback unlink of local file failed:", unlinkErr);
      }
    }

    if (cloudinaryPublicIdToRemove) {
      try {
        const dbInst = DatabaseService.read();
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || dbInst.cloudinaryConfig?.cloudName;
        const apiKey = process.env.CLOUDINARY_API_KEY || dbInst.cloudinaryConfig?.apiKey;
        const apiSecret = process.env.CLOUDINARY_API_SECRET || dbInst.cloudinaryConfig?.apiSecret;

        if (cloudName && apiKey && apiSecret) {
          cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret
          });
          await cloudinary.uploader.destroy(cloudinaryPublicIdToRemove);
        }
      } catch (cloudinaryRollbackErr) {
        console.error("Rollback destroy of Cloudinary asset failed:", cloudinaryRollbackErr);
      }
    }

    if (addedMediaId) {
      try {
        DatabaseService.deleteMedia(addedMediaId);
      } catch (dbErr) {
        console.error("Rollback of database media entry failed:", dbErr);
      }
    }

    return res.status(500).json({ success: false, error: err.message || "An error occurred during file upload." });
  }
});

// Remove entry from index and storage disk/Cloudinary safely
app.delete("/api/media/:id", AuthService.middleware, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, error: "Media element ID is required for deletion" });
    }

    const dbInst = DatabaseService.read();
    const item = dbInst.media?.find(m => m.id === id);
    if (!item) {
      return res.status(404).json({ success: false, error: "Selected image index not found in register" });
    }

    // If it's a Cloudinary URL, delete from Cloudinary first
    if (item.url.includes("cloudinary.com")) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || dbInst.cloudinaryConfig?.cloudName;
      const apiKey = process.env.CLOUDINARY_API_KEY || dbInst.cloudinaryConfig?.apiKey;
      const apiSecret = process.env.CLOUDINARY_API_SECRET || dbInst.cloudinaryConfig?.apiSecret;

      if (cloudName && apiKey && apiSecret) {
        const publicId = getCloudinaryPublicId(item.url);
        if (publicId) {
          cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret
          });
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log(`Physically unlinked Cloudinary publicId: ${publicId}`);
          } catch (cloudDestroyErr) {
            console.warn(`Could not physically delete ${item.url} from Cloudinary:`, cloudDestroyErr);
          }
        }
      }
    }

    const success = DatabaseService.deleteMedia(id);
    if (!success) {
      return res.status(404).json({ success: false, error: "Selected image index not found in register" });
    }

    res.json({ success: true, message: "Asset successfully removed from media storage." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Storage unlinking error occurred" });
  }
});


// ==========================================
// SERVER INITIALIZATION
// ==========================================

async function initServer() {
  // Initialize Neon database first to ensure single source of truth is fully synced!
  try {
    await initializeDatabase();
    console.log("[BOOT] Neon PostgreSQL database initialization complete.");
  } catch (dbErr: any) {
    console.error("[BOOT ERROR] Failed initializing database. Proceeding with fallback mode:", dbErr.message || dbErr);
  }

  // Bootstraps credentials for Secure Admin Session
  const seeded = await AuthService.seedAdminAccount();
  console.log(`[BOOT] Admin system secure. Seed user available: "${seeded.username}" with secret: "${seeded.rawPass}"`);

  // Catch all unmatched api routes and return 404 JSON instead of falling through to Vite/static SPA fallback
  app.all("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint '${req.method} ${req.originalUrl}' not found`,
      error: `API endpoint '${req.method} ${req.originalUrl}' not found`
    });
  });

  if (process.env.NODE_ENV !== "production") {
    // Development mode with Vite reloading
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handling Middleware to catch unexpected technical exceptions safely
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[GLOBAL SERVER ERROR] Uncaught exception:", err);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: "Something went wrong. Please try again.",
      error: err.message || "Something went wrong. Please try again.",
      field: err.field || undefined
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HARDENED BACKEND] Production Server listening on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("CRITICAL BOOT ERROR:", err);
});
