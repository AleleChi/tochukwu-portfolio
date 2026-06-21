# Production Deployment & Migration Blueprint
This guide details the transition architecture required to move this portfolio CMS from the development environment (`db.json` and local disk uploads) into a resilient production stack.

---

## 1. Relational Database Migration: Neon PostgreSQL
For production durability, high-availability, and simultaneous connection safety, the localized key-value `db.json` architecture should be migrated onto **Neon PostgreSQL**.

### Recommended Database Schema
Create the following unified tables to align with the core CMS data model:

```sql
-- 1. Profile Information
CREATE TABLE profile (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  short_bio TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  location VARCHAR(255),
  linkedin VARCHAR(255),
  profile_image TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profile Personas
CREATE TABLE personas (
  id INT PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  portrait_name VARCHAR(100) NOT NULL,
  file_path TEXT NOT NULL,
  mood VARCHAR(255) NOT NULL,
  focus VARCHAR(255) NOT NULL
);

-- 3. Experience Chronology
CREATE TABLE experience (
  id SERIAL PRIMARY KEY,
  year VARCHAR(20) NOT NULL,
  role VARCHAR(150) NOT NULL,
  organization VARCHAR(150) NOT NULL,
  location VARCHAR(150),
  contribution TEXT NOT NULL,
  priority INT DEFAULT 0
);

-- 4. Media Library Catalog
CREATE TABLE media_library (
  id VARCHAR(100) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  alt_text VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  file_size INT,
  uploaded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  original_filename VARCHAR(255),
  uploaded_filename VARCHAR(255)
);
```

### Production Node.js Integration (Drizzle / PG)
In production, use the `pg` pool or `postgres` library with `DATABASE_URL` configured in your hosting platform (Vercel, Render, Cloud Run, etc.):

```ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }
});

// Example transactional query replaces local read/writes:
export async function getProfile() {
  const { rows } = await pool.query("SELECT * FROM profile LIMIT 1");
  return rows[0];
}
```

---

## 2. External Cloud Image Storage (S3 / Cloudinary)
Relying on local disk storage (`/uploads`) is dynamic and stateful, meaning serverless platforms (like Vercel or ephemeral Cloud Run containers) will periodically wipe files upon redeployment or cold starts.

### Recommended Integration Flow
Instead of `fs.writeFileSync(...)`, the `/api/upload` endpoint should streams the optimized `sharp` buffer directly into **Cloudinary** or an **S3 Bucket**:

```ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// To optimize and stream to Cloudinary inside the upload endpoint:
const uploadStream = cloudinary.uploader.upload_stream(
  {
    folder: "portfolio-assets",
    transformation: [
      { width: 1600, height: 1600, crop: "limit" }, // limit oversize
      { fetch_format: "webp", quality: 80 }        // auto web-friendly conversion
    ]
  },
  async (error, result) => {
    if (error || !result) {
      throw new Error("Cloudinary upload failed");
    }
    const finalUrl = result.secure_url; // Real, globally CDNed URL
    
    // Save finalUrl in the Neon database
    await saveMediaRecordToDatabase(finalUrl);
  }
);

// Pipe file buffer from multer memoryStorage directly to the storage provider
uploadStream.end(req.file.buffer);
```

---

## 3. Vercel Deployment Configurations & Build Scripts
This codebase has been optimized for **Vercel** serverless environments:
1. All client-side build artifacts are bundled via Vite into static files under `dist/`.
2. Environment variables are checked lazily on request, avoiding crashes on cold starts if any variables are temporarily missing.
3. Database transactions are isolated and fully sanitized to prevent write collisions.
