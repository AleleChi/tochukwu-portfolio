import { Request, Response } from "express";
import { DatabaseService, ensureDatabaseInitialized, ArticleSchema } from "../server/db";
import { AuthService } from "../server/auth";

export default async function handler(req: Request, res: Response) {
  res.setHeader("Content-Type", "application/json");

  console.log(`\nAPI REQUEST:\n/api/articles`);
  console.log(`ENV CHECK:\nDATABASE_URL available:\n${!!process.env.DATABASE_URL}`);
  console.log("DATABASE CONNECTION START");

  try {
    await ensureDatabaseInitialized();
    console.log("DATABASE CONNECTION SUCCESS");

    if (req.method === "GET") {
      console.log("DATABASE QUERY:\nSELECT content key articles");
      const includeDrafts = req.query.includeDrafts === "true" || !!req.headers.authorization;
      const data = DatabaseService.getArticles(includeDrafts);
      const hasRecord = !!(data && data.length > 0);
      console.log(`DATABASE RESPONSE:\nrecord found:\n${hasRecord}`);

      console.log("API RESPONSE SENT:\nsuccess:\ntrue");
      return res.status(200).json({ success: true, data });
    }

    if (req.method === "POST") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, error: "Authentication challenge token required" });
      }
      const token = authHeader.substring(7);
      const decoded = AuthService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ success: false, error: "Access token is invalid or expired" });
      }

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

      const parsedResult = ArticleSchema.safeParse(newArticle);
      if (!parsedResult.success) {
        const firstIssue = parsedResult.error.issues[0];
        return res.status(400).json({
          success: false,
          error: `Article save failed: ${firstIssue.path.join(".") || "validation failure"} - ${firstIssue.message}`
        });
      }

      db.articles.push(parsedResult.data);
      const saved = await DatabaseService.writeAsync(db);
      if (!saved) {
        return res.status(500).json({ success: false, error: "Database saving failure occurred" });
      }

      console.log("DATABASE UPDATE SUCCESS");
      console.log("API RESPONSE SENT:\nsuccess:\ntrue");
      return res.status(200).json({
        success: true,
        message: "Article successfully created",
        data: parsedResult.data
      });
    }

    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  } catch (err: any) {
    console.error("DATABASE CONNECTION FAILURE DURING REQUEST:", err);
    console.log("API RESPONSE SENT:\nsuccess:\nfalse");
    return res.status(500).json({
      success: false,
      message: "Database connection unavailable."
    });
  }
}
