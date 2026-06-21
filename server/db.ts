import fs from "fs";
import path from "path";
import { z } from "zod";

// Database File Path
const DB_PATH = path.join(process.cwd(), "data", "db.json");

// ==========================================
// ZOD VALIDATION SCHEMAS & INTERFACES
// ==========================================

export const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  shortBio: z.string().min(5, "Bio must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().default(""),
  location: z.string().min(2, "Location must be set to a valid city/country"),
  linkedin: z.string().url("Invalid LinkedIn URL").or(z.string().optional().default("")),
  profileImage: z.string().min(1, "Profile image pathway is required"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const PersonaSchema = z.object({
  id: z.number(),
  label: z.string(),
  portraitName: z.string(),
  filePath: z.string(),
  mood: z.string(),
  focus: z.string()
});

export const HeroSchema = z.object({
  headline: z.string().min(5, "Headline of a storyteller demands detail"),
  highlightedWord: z.string().min(1, "Provide a focal word for visual contrast"),
  description: z.string().min(10, "Describe your core philosophy neatly"),
  primaryCTA: z.string().default("View Portfolio"),
  secondaryCTA: z.string().default("Start Conversation"),
  heroImage: z.string().min(1, "A hero image pathway is required"),
  personas: z.array(PersonaSchema).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),

  // Support alternate key structures for database flexibility
  name: z.string().optional().default(""),
  title: z.string().optional().default(""),
  subtitle: z.string().optional().default(""),
  heroStatement: z.string().optional().default(""),
  ctaPrimary: z.string().optional().default(""),
  ctaSecondary: z.string().optional().default(""),
  imageUrl: z.string().optional().default("")
});

export const PillarSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string()
});

export const PracticeSchema = z.object({
  title: z.string().default("COMMUNICATION PRACTICE"),
  pillars: z.array(PillarSchema).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const AreaOfPracticeSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5)
});

export const ExperienceSchema = z.object({
  id: z.string().optional(), // Ensure unique indexable id is available
  year: z.string().optional().default(""),
  role: z.string().optional().default(""),
  organization: z.string().optional().default(""),
  location: z.string().optional().default(""),
  contribution: z.string().optional().default(""),
  impact: z.string().optional().default(""),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const SpeakingBlockSchema = z.object({
  category: z.string(),
  title: z.string(),
  description: z.string()
});

export const SpeakingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  blocks: z.array(SpeakingBlockSchema).default([]),
  image1: z.string(),
  image2: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const GalleryItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string().min(2),
  category: z.string(),
  location: z.string().nullable().optional().default(""),
  description: z.string(),
  imageUrl: z.string(),
  cloudinaryId: z.string().nullable().optional().default(""),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const RecognitionSchema = z.object({
  title: z.string().min(2),
  caption: z.string().min(2),
  description: z.string().min(5),
  image: z.string(),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const CertificationSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  title: z.string().optional().default(""),
  issuer: z.string().optional().default(""),
  year: z.string().optional().default(""),
  credentialId: z.string().optional().default(""),
  link: z.string().optional().default(""),
  
  // Custom UI Fields for fallback
  institution: z.string().optional().default(""),
  focus: z.string().optional().default(""),
  description: z.string().optional().default(""),
  verification: z.string().optional().default("")
});

export const EducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  period: z.string().optional().default(""),
  timeline: z.string().optional().default(""),
  description: z.string().optional().default("")
});

export const CredentialsSchema = z.object({
  certifications: z.array(CertificationSchema).default([]),
  education: EducationSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const ArticleSchema = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string().min(3),
  category: z.string().optional().default(""),
  readTime: z.string().optional().default(""),
  readingTime: z.string().optional().default(""),
  subtitle: z.string().optional().default(""),
  content: z.string().optional().default(""),
  body: z.string().optional().default(""),
  excerpt: z.string().optional().default(""),
  description: z.string().optional().default(""),
  sections: z.array(z.object({
    heading: z.string().optional().default(""),
    text: z.string().optional().default("")
  })).optional().default([]),
  imageUrl: z.string().optional().default("/input_file_0.png"),
  cloudinaryId: z.string().nullable().optional().default(""),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  date: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const TestimonialSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string().min(2),
  role: z.string().min(2),
  organization: z.string().min(2),
  quote: z.string().min(5),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const ContactReplySchema = z.object({
  id: z.string(),
  recipient: z.string(),
  subject: z.string(),
  message: z.string(),
  date: z.string()
});

export const ContactSubmissionSchema = z.object({
  id: z.number(),
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().default("Inquiry"),
  message: z.string().min(5),
  date: z.string(),
  createdAt: z.string().optional(),
  organization: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  status: z.enum(["New", "Read", "Archived", "Replied"]).default("New"),
  replies: z.array(ContactReplySchema).optional().default([])
});

export const SelectedWorkItemSchema = z.object({
  id: z.string(),
  organization: z.string(),
  title: z.string(),
  role: z.string(),
  focus: z.string(),
  contributions: z.array(z.string()).default([]),
  impact: z.string(),
  graphicHeader: z.string().optional(),
  graphicTitle: z.string().optional(),
  graphicLabel1: z.string().optional(),
  graphicValue1: z.string().optional(),
  graphicDesc1: z.string().optional(),
  graphicItems: z.array(z.object({
    label: z.string(),
    tag: z.string()
  })).optional()
});

export const OrganizationSchema = z.object({
  logoName: z.string(),
  fullName: z.string(),
  roleType: z.string(),
  region: z.string(),
  icon: z.string().optional()
});

// Admin User configuration for Phase 3
export const MediaItemSchema = z.object({
  id: z.string(),
  filename: z.string(),
  url: z.string(),
  altText: z.string(),
  category: z.enum(["profile", "hero", "experience", "speaking", "gallery", "recognition", "articles", "other"]).default("other"),
  uploadedDate: z.string(),
  fileSize: z.number().optional(),
  originalFilename: z.string().optional().nullable(),
  uploadedFilename: z.string().optional().nullable()
});

export const AdminUserSchema = z.object({
  username: z.string(),
  passwordHash: z.string(),
  updatedAt: z.string().optional()
});

export const CMSAdminUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  role: z.enum(["Studio Owner", "Administrator"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastLogin: z.string().optional().nullable(),
  tokenVersion: z.string().optional()
});

export type CMSAdminUser = z.infer<typeof CMSAdminUserSchema>;

export const CloudinaryConfigSchema = z.object({
  cloudName: z.string().default(""),
  apiKey: z.string().default(""),
  apiSecret: z.string().default(""),
  provider: z.string().default("cloudinary")
});

export type CloudinaryConfig = z.infer<typeof CloudinaryConfigSchema>;

// Entire DB Root Schema
export const DatabaseSchema = z.object({
  profile: ProfileSchema,
  hero: HeroSchema,
  practice: PracticeSchema,
  areasOfPractice: z.array(AreaOfPracticeSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  selectedWork: z.array(SelectedWorkItemSchema).default([]),
  organisations: z.array(OrganizationSchema).default([]),
  speaking: SpeakingSchema.optional(),
  gallery: z.array(GalleryItemSchema).default([]),
  recognition: RecognitionSchema,
  certifications: z.array(CertificationSchema).default([]),
  education: EducationSchema.optional(),
  articles: z.array(ArticleSchema).default([]),
  testimonials: z.array(TestimonialSchema).default([]),
  contactSubmissions: z.array(ContactSubmissionSchema).default([]),
  media: z.array(MediaItemSchema).default([]),
  admin: AdminUserSchema.optional(),
  adminUsers: z.array(CMSAdminUserSchema).default([]),
  cloudinaryConfig: CloudinaryConfigSchema.optional()
});

export type IDatabase = z.infer<typeof DatabaseSchema>;

import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
let dbPool: any = null;
let memoryDb: IDatabase | null = null;
let initPromise: Promise<void> | null = null;

export function getPool() {
  if (!dbPool && connectionString) {
    dbPool = new Pool({
      connectionString,
      ssl: connectionString.includes("sslmode=require") || connectionString.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : false
    });
  }
  return dbPool;
}

export function ensureDatabaseInitialized(): Promise<void> {
  if (memoryDb) return Promise.resolve();
  if (!initPromise) {
    initPromise = initializeDatabase().catch(err => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export async function initializeDatabase() {
  console.log("DATABASE CONNECTION START");
  const pool = getPool();
  if (!pool) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      console.error("[DB] CRITICAL: DATABASE_URL environment variable is missing on Vercel / Production deployment.");
      throw new Error("DATABASE_URL environment variable is missing.");
    }
    console.warn("[DB] No DATABASE_URL environment variable provided. Running on local files fallback.");
    // Fallback to local db.json
    try {
      const localDbPath = path.join(process.cwd(), "data", "db.json");
      if (fs.existsSync(localDbPath)) {
        const raw = fs.readFileSync(localDbPath, "utf-8");
        memoryDb = DatabaseService.normalize(JSON.parse(raw));
      } else {
        memoryDb = DatabaseService.normalize({});
      }
    } catch (e) {
      memoryDb = DatabaseService.normalize({});
    }
    console.log("DATABASE CONNECTED SUCCESSFULLY (Fallback Memory/File DB)");
    console.log("DATABASE CONNECTION SUCCESS");
    return;
  }

  try {
    console.log("[DB] Connecting to Neon PostgreSQL...");
    // Create portfolio_cms table if not configured
    await pool.query(`
      CREATE TABLE IF NOT EXISTS portfolio_cms (
        key VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("[DB] Table 'portfolio_cms' verified in Neon PostgreSQL.");
    console.log("DATABASE CONNECTED SUCCESSFULLY");
    console.log("DATABASE CONNECTION SUCCESS");

    const { rows } = await pool.query("SELECT key, data FROM portfolio_cms");
    const postgresData: any = {};
    rows.forEach((row: any) => {
      postgresData[row.key] = row.data;
    });

    const keys = Object.keys(postgresData);
    if (keys.length > 0) {
      console.log(`[DB] Successfully synced and loaded ${keys.length} CMS segments from Neon PostgreSQL.`);
      memoryDb = DatabaseService.normalize(postgresData);
    } else {
      console.log("[DB] Neon PostgreSQL is empty, trigger automatic system migration from local file storage...");
      const localDbPath = path.join(process.cwd(), "data", "db.json");
      let initialData: IDatabase;

      if (fs.existsSync(localDbPath)) {
        console.log("[DB-MIGRATION] Local db.json detected. Migrating existing dataset with fidelity...");
        try {
          const raw = fs.readFileSync(localDbPath, "utf-8");
          initialData = DatabaseService.normalize(JSON.parse(raw));
        } catch (err) {
          console.error("[DB-MIGRATION] Failed parsing local dataset. Reverting to schema default baseline.", err);
          initialData = DatabaseService.normalize({});
        }
      } else {
        console.log("[DB-MIGRATION] No local file storage found. Populating empty database with default CMS settings.");
        initialData = DatabaseService.normalize({});
      }

      // Upsert every CMS block to Neon PostgreSQL
      for (const [key, val] of Object.entries(initialData)) {
        await pool.query(`
          INSERT INTO portfolio_cms (key, data, updated_at) 
          VALUES ($1, $2, NOW())
          ON CONFLICT (key)
          DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
        `, [key, JSON.stringify(val)]);
      }
      console.log("[DB-MIGRATION] Multi-entity asset data migration to Neon PostgreSQL successfully persisted.");
      memoryDb = initialData;
    }
  } catch (err: any) {
    console.error("[DB] CRITICAL PostgreSQL connection/initialization failure. Initializing locally to preserve site availability.", err);
    throw err;
  }
}

// ==========================================
// DATA SERVICE ENGINE
// ==========================================

export class DatabaseService {
  private static initCompleted = false;

  private static ensureDataDirectory() {
    const dir = path.dirname(DB_PATH);
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (err) {
      console.warn("[WARNING] Skipping local database directory initialization (read-only system):", err);
    }
  }

  // Reads database, performs transparent structural healing on miss matches
  public static read(): IDatabase {
    if (!memoryDb) {
      console.warn("[DB] Warning: database read requested before Neon system initialization. Performing emergency fallback loading.");
      this.ensureDataDirectory();
      try {
        if (!fs.existsSync(DB_PATH)) {
          throw new Error("No database file exists");
        }
        const raw = fs.readFileSync(DB_PATH, "utf-8");
        const obj = JSON.parse(raw);
        memoryDb = this.normalize(obj);
      } catch (err) {
        memoryDb = this.getFallbackDatabase();
      }
    }
    return memoryDb;
  }

  // Transparent self-healing structural and schema normalization routine
  public static normalize(obj: any): IDatabase {
    if (!obj || typeof obj !== "object") {
      obj = {};
    }

    // 1. Core Profile
    if (!obj.profile || typeof obj.profile !== "object") {
      obj.profile = {};
    }
    obj.profile = {
      name: obj.profile.name || "Tochukwu Ogunaka",
      title: obj.profile.title || "Strategic Communication Professional",
      shortBio: obj.profile.shortBio || "Through strategic communication, public engagement, and storytelling...",
      email: obj.profile.email || "ogunakatochukwu@gmail.com",
      phone: obj.profile.phone || "+234 816 539 9171",
      location: obj.profile.location || "Abuja, Nigeria",
      linkedin: obj.profile.linkedin || "https://www.linkedin.com/in/ogunakatochukwu/",
      profileImage: obj.profile.profileImage || "/input_file_1.png",
      createdAt: obj.profile.createdAt || new Date().toISOString(),
      updatedAt: obj.profile.updatedAt || new Date().toISOString()
    };

    // 2. Hero Section
    if (!obj.hero || typeof obj.hero !== "object") {
      obj.hero = {};
    }
    obj.hero = {
      headline: obj.hero.headline || "Building clarity between organizations, communities, and people.",
      highlightedWord: obj.hero.highlightedWord || "clarity",
      description: obj.hero.description || "Crafting high-impact strategic communications, coordinating public engagement initiatives, and directing media engagement strategies to foster trust and clear storytelling.",
      primaryCTA: obj.hero.primaryCTA || "View Portfolio",
      secondaryCTA: obj.hero.secondaryCTA || "Start Conversation",
      heroImage: obj.hero.heroImage || "/input_file_0.png",
      personas: Array.isArray(obj.hero.personas) ? obj.hero.personas.map((p: any) => ({
        id: typeof p.id === "number" ? p.id : 0,
        label: p.label || "Communication",
        portraitName: p.portraitName || "Portrait Name",
        filePath: p.filePath || "/input_file_0.png",
        mood: p.mood || "Professional",
        focus: p.focus || "Strategic focus support"
      })) : [],
      createdAt: obj.hero.createdAt || new Date().toISOString(),
      updatedAt: obj.hero.updatedAt || new Date().toISOString(),

      // Align alternate key structures
      name: obj.hero.name || obj.profile?.name || "Tochukwu Ogunaka",
      title: obj.hero.title || obj.profile?.title || "Communication Professional & Media Specialist",
      subtitle: obj.hero.subtitle || obj.hero.headline || "Building clarity between organizations, communities, and people.",
      heroStatement: obj.hero.heroStatement || obj.hero.description || "Crafting high-impact strategic communications, coordinating public engagement initiatives, and directing media engagement strategies to foster trust and clear storytelling.",
      ctaPrimary: obj.hero.ctaPrimary || obj.hero.primaryCTA || "View Portfolio",
      ctaSecondary: obj.hero.ctaSecondary || obj.hero.secondaryCTA || "Start Conversation",
      imageUrl: obj.hero.imageUrl || obj.hero.heroImage || "/input_file_0.png"
    };

    // 3. Practice
    if (!obj.practice || typeof obj.practice !== "object") {
      obj.practice = {};
    }
    obj.practice = {
      title: obj.practice.title || "COMMUNICATION PRACTICE",
      pillars: Array.isArray(obj.practice.pillars) ? obj.practice.pillars.map((pil: any) => ({
        id: pil.id || "01",
        title: pil.title || "",
        description: pil.description || ""
      })) : []
    };

    // 4. Areas of Practice
    if (Array.isArray(obj.areasOfPractice)) {
      obj.areasOfPractice = obj.areasOfPractice.map((ap: any) => ({
        title: ap.title || "Area Focus",
        description: ap.description || "Area description"
      }));
    } else {
      obj.areasOfPractice = [];
    }

    // 5. Experience
    if (Array.isArray(obj.experience)) {
      obj.experience = obj.experience.map((e: any) => ({
        id: e.id !== undefined && e.id !== null ? String(e.id) : Math.random().toString(36).substr(2, 9),
        year: e.year !== undefined && e.year !== null ? String(e.year) : "",
        role: e.role !== undefined && e.role !== null ? String(e.role) : "",
        organization: e.organization !== undefined && e.organization !== null ? String(e.organization) : "",
        location: e.location !== undefined && e.location !== null ? String(e.location) : "",
        contribution: e.contribution !== undefined && e.contribution !== null ? String(e.contribution) : "",
        impact: e.impact !== undefined && e.impact !== null ? String(e.impact) : "",
        status: e.status || "published",
        createdAt: e.createdAt || new Date().toISOString(),
        updatedAt: e.updatedAt || new Date().toISOString()
      }));
    } else {
      obj.experience = [];
    }

    // 6. Selected Work
    if (Array.isArray(obj.selectedWork)) {
      obj.selectedWork = obj.selectedWork.map((s: any) => ({
        id: s.id !== undefined ? String(s.id) : Math.random().toString(36).substr(2, 9),
        organization: s.organization || "",
        title: s.title || "",
        role: s.role || "",
        focus: s.focus || "",
        contributions: Array.isArray(s.contributions) ? s.contributions : [],
        impact: s.impact || "",
        graphicHeader: s.graphicHeader || "Project Stats",
        graphicTitle: s.graphicTitle || "Success Highlights",
        graphicLabel1: s.graphicLabel1 || "",
        graphicValue1: s.graphicValue1 || "",
        graphicDesc1: s.graphicDesc1 || "",
        graphicItems: Array.isArray(s.graphicItems) ? s.graphicItems : []
      }));
    } else {
      obj.selectedWork = [];
    }

    // 7. Organizations
    if (!Array.isArray(obj.organisations)) {
      obj.organisations = [];
    }

    // 8. Speaking
    if (!obj.speaking || typeof obj.speaking !== "object") {
      obj.speaking = {
        title: "Speaking & Leadership Engagement",
        description: "Contributes to dialogue, panels, and masterclasses...",
        blocks: [],
        image1: "/input_file_3.png",
        image2: "/input_file_2.png"
      };
    }

    // 9. Gallery
    if (Array.isArray(obj.gallery)) {
      obj.gallery = obj.gallery.map((g: any) => ({
        id: g.id !== undefined && g.id !== null ? String(g.id) : Math.random().toString(36).substr(2, 9),
        title: g.title || "Gallery Item",
        category: g.category || "Events",
        location: g.location !== undefined && g.location !== null ? String(g.location) : "",
        description: g.description || "Description details",
        imageUrl: g.imageUrl || "/input_file_0.png",
        cloudinaryId: g.cloudinaryId !== undefined && g.cloudinaryId !== null ? String(g.cloudinaryId) : "",
        status: g.status || "published",
        createdAt: g.createdAt || new Date().toISOString(),
        updatedAt: g.updatedAt || new Date().toISOString()
      }));
    } else {
      obj.gallery = [];
    }

    // 10. Recognition
    if (!obj.recognition || typeof obj.recognition !== "object") {
      obj.recognition = {};
    }
    obj.recognition = {
      title: obj.recognition.title || "Spotlight Recognition",
      caption: obj.recognition.caption || "[ FEATURED PRESS ]",
      description: obj.recognition.description || "Published feature details",
      image: obj.recognition.image || "/input_file_2.png",
      status: obj.recognition.status || "published",
      areasHighlighted: Array.isArray(obj.recognition.areasHighlighted) ? obj.recognition.areasHighlighted : [],
      createdAt: obj.recognition.createdAt || new Date().toISOString(),
      updatedAt: obj.recognition.updatedAt || new Date().toISOString()
    };

    // 11. Certifications (Resilient Dual-Sync Mapping)
    if (Array.isArray(obj.certifications)) {
      obj.certifications = obj.certifications.map((c: any) => {
        const title = c.title !== undefined && c.title !== null ? String(c.title).trim() : (c.focus !== undefined && c.focus !== null ? String(c.focus).trim() : "");
        const issuer = c.issuer !== undefined && c.issuer !== null ? String(c.issuer).trim() : (c.institution !== undefined && c.institution !== null ? String(c.institution).trim() : "");
        const year = c.year !== undefined && c.year !== null ? String(c.year).trim() : (c.verification !== undefined && c.verification !== null ? String(c.verification).trim() : "");
        const institution = c.institution !== undefined && c.institution !== null ? String(c.institution).trim() : issuer;
        const focus = c.focus !== undefined && c.focus !== null ? String(c.focus).trim() : title;
        const description = c.description !== undefined && c.description !== null ? String(c.description).trim() : "";
        const verification = c.verification !== undefined && c.verification !== null ? String(c.verification).trim() : "";
        const credentialId = c.credentialId !== undefined && c.credentialId !== null ? String(c.credentialId).trim() : "";
        const link = c.link !== undefined && c.link !== null ? String(c.link).trim() : "";

        return {
          id: c.id !== undefined && c.id !== null ? String(c.id) : Math.random().toString(36).substr(2, 9),
          title: title || "",
          issuer: issuer || "",
          year: year || "",
          credentialId: credentialId || "",
          link: link || "",
          institution: institution || "",
          focus: focus || "",
          description: description || "",
          verification: verification || ""
        };
      });
    } else {
      obj.certifications = [];
    }

    // 12. Education
    if (!obj.education || typeof obj.education !== "object") {
      obj.education = {
        degree: "B.Sc. Sociology",
        institution: "Ahmadu Bello University",
        period: "B.A. (Hons)",
        timeline: "Second Best Graduating",
        description: ""
      };
    } else {
      obj.education = {
        degree: obj.education.degree !== undefined && obj.education.degree !== null ? String(obj.education.degree) : "",
        institution: obj.education.institution !== undefined && obj.education.institution !== null ? String(obj.education.institution) : "",
        period: obj.education.period !== undefined && obj.education.period !== null ? String(obj.education.period) : (obj.education.timeline !== undefined && obj.education.timeline !== null ? String(obj.education.timeline) : ""),
        timeline: obj.education.timeline !== undefined && obj.education.timeline !== null ? String(obj.education.timeline) : (obj.education.period !== undefined && obj.education.period !== null ? String(obj.education.period) : ""),
        description: obj.education.description !== undefined && obj.education.description !== null ? String(obj.education.description) : ""
      };
    }

    // 13. Articles
    if (Array.isArray(obj.articles)) {
      obj.articles = obj.articles.map((art: any) => ({
        id: art.id !== undefined && art.id !== null ? String(art.id) : Math.random().toString(36).substr(2, 9),
        title: art.title || "",
        category: art.category || "",
        readTime: art.readTime || art.readingTime || "5 Min Read",
        readingTime: art.readingTime || art.readTime || "5 Min Read",
        subtitle: art.subtitle || "",
        content: art.content || art.description || art.body || "",
        body: art.body || art.content || "",
        excerpt: art.excerpt || art.subtitle || "",
        description: art.description || art.content || "",
        sections: Array.isArray(art.sections) ? art.sections.map((sec: any) => ({
          heading: sec.heading || "",
          text: sec.text || ""
        })) : [],
        imageUrl: art.imageUrl || art.coverImage || "/input_file_0.png",
        cloudinaryId: art.cloudinaryId || "",
        status: art.status || "published",
        date: art.date || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        createdAt: art.createdAt || new Date().toISOString(),
        updatedAt: art.updatedAt || new Date().toISOString()
      }));
    } else {
      obj.articles = [];
    }

    // 14. Testimonials
    if (Array.isArray(obj.testimonials)) {
      obj.testimonials = obj.testimonials.map((t: any) => ({
        id: t.id !== undefined ? t.id : Math.random().toString(36).substr(2, 9),
        name: t.name || "",
        role: t.role || "",
        organization: t.organization || "",
        quote: t.quote || "",
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt || new Date().toISOString()
      }));
    } else {
      obj.testimonials = [];
    }

    // 15. Contact Submissions
    if (Array.isArray(obj.contactSubmissions)) {
      obj.contactSubmissions = obj.contactSubmissions.map((cs: any) => ({
        id: cs.id || Date.now(),
        name: cs.name || "",
        email: cs.email || "",
        subject: cs.subject || "Inquiry",
        message: cs.message || "",
        date: cs.date || new Date().toISOString(),
        organization: cs.organization || "",
        category: cs.category || "",
        status: cs.status || "New",
        replies: Array.isArray(cs.replies) ? cs.replies : []
      }));
    } else {
      obj.contactSubmissions = [];
    }

    // 16. Media
    if (Array.isArray(obj.media)) {
      obj.media = obj.media.map((m: any) => ({
        id: m.id || Math.random().toString(36).substr(2, 9),
        filename: m.filename || "",
        url: m.url || "",
        altText: m.altText || "",
        category: m.category || "other",
        uploadedDate: m.uploadedDate || new Date().toISOString(),
        fileSize: m.fileSize || 0,
        originalFilename: m.originalFilename || "",
        uploadedFilename: m.uploadedFilename || ""
      }));
    } else {
      obj.media = [];
    }

    // 17. Admin and AdminUsers
    if (!obj.admin) {
      obj.admin = {
        username: "admin",
        passwordHash: "$2b$10$u5raGJwOgnSRP1gnMvA5TOE9INoj7RFJzZsPwYcxHAh52K04xoePu"
      };
    }
    if (Array.isArray(obj.adminUsers)) {
      obj.adminUsers = obj.adminUsers.map((au: any) => ({
        id: au.id || "admin-1",
        name: au.name || "Administrator",
        email: au.email || "ogunakatochukwu@gmail.com",
        passwordHash: au.passwordHash || "$2b$10$u5raGJwOgnSRP1gnMvA5TOE9INoj7RFJzZsPwYcxHAh52K04xoePu",
        role: au.role || "Administrator",
        createdAt: au.createdAt || new Date().toISOString(),
        updatedAt: au.updatedAt || new Date().toISOString(),
        lastLogin: au.lastLogin || null,
        tokenVersion: au.tokenVersion || "v1"
      }));
    } else {
      obj.adminUsers = [];
    }

    // 18. Cloudinary
    if (!obj.cloudinaryConfig) {
      obj.cloudinaryConfig = {
        cloudName: "",
        apiKey: "",
        apiSecret: "",
        provider: "cloudinary"
      };
    }

    return obj as IDatabase;
  }

  // Writes to database securely with atomic validation to prevent corruption and pushes live to Neon PostgreSQL
  public static write(db: IDatabase): boolean {
    memoryDb = db;

    // Background push updates live into Neon PostgreSQL
    const pool = getPool();
    if (pool) {
      Promise.all(
        Object.entries(db).map(([key, val]) => {
          return pool.query(`
            INSERT INTO portfolio_cms (key, data, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (key)
            DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
          `, [key, JSON.stringify(val)]).catch((err: any) => {
            console.error(`[DB-UPSERT ERROR] Failed background sync for key "${key}":`, err);
          });
        })
      ).then(() => {
        console.log("[DB] Neon PostgreSQL live synchronization finished successfully.");
      }).catch((syncErr) => {
        console.error("[DB] Live database write background synchronization sequence failed:", syncErr);
      });
    }

    this.ensureDataDirectory();
    const tempPath = `${DB_PATH}.tmp`;
    try {
      // 1. Write to a temporary file
      const dataStr = JSON.stringify(db, null, 2);
      fs.writeFileSync(tempPath, dataStr, "utf-8");

      // 2. Validate that temp file can be parsed correctly and is not empty/corrupted
      const parsed = JSON.parse(fs.readFileSync(tempPath, "utf-8"));
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Temporary file parsed to invalid structure or value.");
      }

      // 3. Atomically rename the validated file to replace the original
      fs.renameSync(tempPath, DB_PATH);
      return true;
    } catch (err) {
      console.error("Critical: Failed writing data onto local db.json cache", err);
      // Clean up the temporary file if it still exists
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (cleanupErr) {
        // Silently ignore cleanup errors
      }
      if (process.env.VERCEL || pool) {
        return true;
      }
      return false;
    }
  }

  // Writes to database securely and AWAITS live Neon PostgreSQL synchronization
  public static async writeAsync(db: IDatabase): Promise<boolean> {
    memoryDb = db;

    let postgresSucceeded = true;
    const pool = getPool();
    if (pool) {
      try {
        await Promise.all(
          Object.entries(db).map(async ([key, val]) => {
            await pool.query(`
              INSERT INTO portfolio_cms (key, data, updated_at)
              VALUES ($1, $2, NOW())
              ON CONFLICT (key)
              DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
            `, [key, JSON.stringify(val)]);
          })
        );
        console.log("[DB] Neon PostgreSQL live synchronization finished successfully.");
      } catch (syncErr) {
        console.error("[DB] Live database write synchronization sequence failed:", syncErr);
        postgresSucceeded = false;
      }
    }

    this.ensureDataDirectory();
    const tempPath = `${DB_PATH}.tmp`;
    try {
      const dataStr = JSON.stringify(db, null, 2);
      fs.writeFileSync(tempPath, dataStr, "utf-8");
      const parsed = JSON.parse(fs.readFileSync(tempPath, "utf-8"));
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Temporary file parsed to invalid structure or value.");
      }
      fs.renameSync(tempPath, DB_PATH);
      return postgresSucceeded;
    } catch (err) {
      console.error("Critical: Failed writing data onto local db.json cache", err);
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (cleanupErr) {}
      if (process.env.VERCEL || pool) {
        return postgresSucceeded;
      }
      return false;
    }
  }

  // Self-healing database baseline provider
  private static getFallbackDatabase(): IDatabase {
    return {
      profile: {
        name: "Tochukwu Ogunaka",
        title: "Communication Professional & Media Specialist",
        shortBio: "Through strategic communication, public engagement, and storytelling, I help organizations communicate with purpose, build trust, and create meaningful connections.",
        email: "ogunakatochukwu@gmail.com",
        phone: "+234 816 539 9171",
        location: "Abuja, Nigeria",
        linkedin: "https://www.linkedin.com/in/ogunakatochukwu/",
        profileImage: "/input_file_1.png"
      },
      hero: {
        headline: "Building clarity between organizations, communities, and people.",
        highlightedWord: "clarity",
        description: "Crafting high-impact strategic communications, coordinating public engagement initiatives, and directing media engagement strategies to foster trust and clear storytelling.",
        primaryCTA: "View Portfolio",
        secondaryCTA: "Start Conversation",
        heroImage: "/input_file_0.png",
        personas: [],
        name: "Tochukwu Ogunaka",
        title: "Communication Professional & Media Specialist",
        subtitle: "Building clarity between organizations, communities, and people.",
        heroStatement: "Crafting high-impact strategic communications, coordinating public engagement initiatives, and directing media engagement strategies to foster trust and clear storytelling.",
        ctaPrimary: "View Portfolio",
        ctaSecondary: "Start Conversation",
        imageUrl: "/input_file_0.png"
      },
      practice: {
        title: "COMMUNICATION PRACTICE // 02",
        pillars: []
      },
      areasOfPractice: [],
      experience: [],
      selectedWork: [],
      organisations: [],
      gallery: [],
      recognition: {
        title: "National Spotlight Advocacy Feature",
        caption: "[ FEATURED PRESS ADVISORY // ABUJA ]",
        description: "Published and distributed across prime development segments, highlighting modern stakeholder alignment, youth-driven digital equity programs, and senior citizen advocacy initiatives across Nigeria.",
        image: "/input_file_2.png",
        status: "published"
      },
      certifications: [],
      articles: [],
      testimonials: [],
      contactSubmissions: [],
      media: [],
      adminUsers: [],
      cloudinaryConfig: {
        cloudName: "",
        apiKey: "",
        apiSecret: "",
        provider: "cloudinary"
      }
    };
  }

  // ==========================================
  // MODEL-SPECIFIC API OPERATIONS (Hardened)
  // ==========================================

  public static getProfile() {
    const db = this.read();
    return db.profile;
  }

  public static updateProfile(input: any) {
    const parsed = ProfileSchema.parse(input);
    const db = this.read();
    
    parsed.updatedAt = new Date().toISOString();
    parsed.createdAt = db.profile?.createdAt || new Date().toISOString();
    
    db.profile = parsed;
    this.write(db);
    return parsed;
  }

  public static getHero() {
    const db = this.read();
    return db.hero;
  }

  public static updateHero(input: any) {
    const parsed = HeroSchema.parse(input);
    const db = this.read();
    
    parsed.updatedAt = new Date().toISOString();
    parsed.createdAt = db.hero?.createdAt || new Date().toISOString();
    
    db.hero = parsed;
    this.write(db);
    return parsed;
  }

  public static getExperiences(includeDrafts = false) {
    const db = this.read();
    let list = db.experience || [];
    if (!includeDrafts) {
      list = list.filter(item => item.status === "published" || !item.status);
    }
    return list;
  }

  public static updateExperiences(list: any[]) {
    // Validate each item
    const parsedList = list.map(item => {
      const idx = item.id || Math.random().toString(36).substr(2, 9);
      const val = ExperienceSchema.parse({
        ...item,
        id: idx,
        status: item.status || "published"
      });
      if (!val.createdAt) val.createdAt = new Date().toISOString();
      val.updatedAt = new Date().toISOString();
      return val;
    });

    const db = this.read();
    db.experience = parsedList;
    this.write(db);
    return parsedList;
  }

  public static getGallery(includeDrafts = false) {
    const db = this.read();
    let list = db.gallery || [];
    if (!includeDrafts) {
      list = list.filter(item => item.status === "published" || !item.status);
    }
    return list;
  }

  public static updateGallery(list: any[]) {
    const parsedList = list.map(item => {
      const id = item.id !== undefined && item.id !== null ? item.id : Date.now() + Math.floor(Math.random() * 100);
      const val = GalleryItemSchema.parse({
        ...item,
        id,
        location: item.location || "",
        cloudinaryId: item.cloudinaryId || "",
        status: item.status || "published"
      });
      if (!val.createdAt) val.createdAt = new Date().toISOString();
      val.updatedAt = new Date().toISOString();
      return val;
    });
    const db = this.read();
    db.gallery = parsedList;
    this.write(db);
    return parsedList;
  }

  public static getArticles(includeDrafts = false) {
    const db = this.read();
    let list = db.articles || [];
    if (!includeDrafts) {
      list = list.filter(item => item.status === "published" || !item.status);
    }
    return list;
  }

  public static updateArticles(list: any[]) {
    const parsedList = list.map(item => {
      const id = item.id !== undefined && item.id !== null ? item.id : Date.now() + Math.floor(Math.random() * 100);
      const val = ArticleSchema.parse({
        ...item,
        id,
        imageUrl: item.imageUrl || item.coverImage || "/input_file_0.png",
        status: item.status || "published"
      });
      if (!val.createdAt) val.createdAt = new Date().toISOString();
      val.updatedAt = new Date().toISOString();
      return val;
    });
    const db = this.read();
    db.articles = parsedList;
    this.write(db);
    return parsedList;
  }

  public static getSpeaking() {
    const db = this.read();
    return db.speaking;
  }

  public static updateSpeaking(input: any) {
    const parsed = SpeakingSchema.parse(input);
    const db = this.read();
    parsed.updatedAt = new Date().toISOString();
    parsed.createdAt = db.speaking?.createdAt || new Date().toISOString();
    db.speaking = parsed;
    this.write(db);
    return parsed;
  }

  public static getRecognition() {
    const db = this.read();
    return db.recognition;
  }

  public static updateRecognition(input: any) {
    const parsed = RecognitionSchema.parse(input);
    const db = this.read();
    parsed.updatedAt = new Date().toISOString();
    parsed.createdAt = db.recognition?.createdAt || new Date().toISOString();
    db.recognition = parsed;
    this.write(db);
    return parsed;
  }

  public static getTestimonials() {
    const db = this.read();
    return db.testimonials || [];
  }

  public static updateTestimonials(list: any[]) {
    const parsedList = list.map(item => {
      const id = item.id !== undefined ? item.id : Date.now() + Math.floor(Math.random() * 100);
      const val = TestimonialSchema.parse({ ...item, id });
      if (!val.createdAt) val.createdAt = new Date().toISOString();
      val.updatedAt = new Date().toISOString();
      return val;
    });
    const db = this.read();
    db.testimonials = parsedList;
    this.write(db);
    return parsedList;
  }

  public static addContactSubmission(input: any) {
    const db = this.read();
    if (!db.contactSubmissions) db.contactSubmissions = [];

    // Check for duplicate in the last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const isDuplicate = db.contactSubmissions.some(sub => {
      const subTime = new Date(sub.date || sub.createdAt || Date.now()).getTime();
      return (
        sub.email.toLowerCase() === input.email.toLowerCase() &&
        (sub.subject || "").trim() === (input.subject || "General Inquiry").trim() &&
        (sub.message || "").trim() === (input.message || "").trim() &&
        subTime > oneDayAgo
      );
    });

    if (isDuplicate) {
      throw new Error("Duplicate submission: A message with the same email, subject and content was already submitted within the last 24 hours.");
    }

    const parsed = ContactSubmissionSchema.parse({
      ...input,
      id: Date.now(),
      date: new Date().toISOString()
    });
    
    parsed.createdAt = new Date().toISOString();
    db.contactSubmissions.push(parsed);
    this.write(db);
    return parsed;
  }

  public static getContactSubmissions() {
    const db = this.read();
    return db.contactSubmissions || [];
  }

  public static updateContactSubmissionStatus(id: number, status: "New" | "Read" | "Archived" | "Replied") {
    const db = this.read();
    if (!db.contactSubmissions) db.contactSubmissions = [];
    const index = db.contactSubmissions.findIndex(sub => sub.id === id);
    if (index !== -1) {
      db.contactSubmissions[index].status = status;
      this.write(db);
      return db.contactSubmissions[index];
    }
    return null;
  }

  public static addSubmissionReply(id: number, reply: { recipient: string; subject: string; message: string }) {
    const db = this.read();
    if (!db.contactSubmissions) db.contactSubmissions = [];
    const index = db.contactSubmissions.findIndex(sub => sub.id === id);
    if (index !== -1) {
      const submission = db.contactSubmissions[index];
      if (!submission.replies) {
        submission.replies = [];
      }
      
      const newReply = {
        id: Math.random().toString(36).substr(2, 9),
        recipient: reply.recipient,
        subject: reply.subject,
        message: reply.message,
        date: new Date().toISOString()
      };
      
      submission.replies.push(newReply);
      submission.status = "Replied";
      
      this.write(db);
      return submission;
    }
    return null;
  }

  public static deleteContactSubmission(id: number) {
    const db = this.read();
    if (!db.contactSubmissions) db.contactSubmissions = [];
    db.contactSubmissions = db.contactSubmissions.filter(sub => sub.id !== id);
    this.write(db);
    return true;
  }

  // ==========================================
  // MEDIA LIBRARY OPERATIONS
  // ==========================================

  public static getMedia() {
    const db = this.read();
    return db.media || [];
  }

  public static addMedia(input: any) {
    const parsed = MediaItemSchema.parse({
      id: input.id || Math.random().toString(36).substr(2, 9),
      filename: input.filename,
      url: input.url,
      altText: input.altText || "Tochukwu Ogunaka Portfolio Media",
      category: input.category || "other",
      uploadedDate: new Date().toISOString(),
      fileSize: input.fileSize,
      originalFilename: input.originalFilename || input.filename,
      uploadedFilename: input.uploadedFilename || input.filename
    });
    
    const db = this.read();
    if (!db.media) db.media = [];
    db.media.push(parsed);
    this.write(db);
    return parsed;
  }

  public static deleteMedia(id: string) {
    const db = this.read();
    const item = db.media?.find(m => m.id === id);
    if (item) {
      // Attempt disk deletion
      try {
        const relativeDiskPath = item.url.startsWith("/") ? item.url.slice(1) : item.url;
        const filePath = path.join(process.cwd(), relativeDiskPath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Physically unlinked uploaded file: ${filePath}`);
        }
      } catch (err) {
        console.warn(`Could not physically delete ${item.url} from server storage:`, err);
      }
      
      db.media = db.media.filter(m => m.id !== id);
      this.write(db);
      return true;
    }
    return false;
  }
}
