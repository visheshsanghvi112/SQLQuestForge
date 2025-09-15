import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sqlEngine } from "./services/sql-engine";
import { levelManager } from "./services/level-manager";
import { queryExecutionSchema, hintRequestSchema, levelProgressSchema, aiAskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create new game session
  app.post("/api/session", async (req, res) => {
    try {
      const session = await storage.createSession();
      res.json({ session });
    } catch (error) {
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Get session details
  app.get("/api/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json({ session });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve session" });
    }
  });

  // Get level details
  app.get("/api/level/:levelId", async (req, res) => {
    try {
      const levelId = parseInt(req.params.levelId);
      const level = await levelManager.getLevel(levelId);
      
      if (!level) {
        return res.status(404).json({ error: "Level not found" });
      }
      
      res.json({ level });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve level" });
    }
  });

  // Execute SQL query
  app.post("/api/execute", async (req, res) => {
    try {
      const parsed = queryExecutionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const { sessionId, level, query } = parsed.data;
      
      // Validate session exists
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Execute query
      const result = await sqlEngine.executeQuery(sessionId, level, query);
      
      // Store result
      await storage.storeQueryResult(sessionId, result);
      
      // Update session if query was correct
      if (result.isCorrect && result.scoreEarned) {
        await storage.updateSession(sessionId, {
          score: session.score + result.scoreEarned
        });
      }
      
      res.json({ result });
    } catch (error) {
      console.error("Query execution error:", error);
      res.status(500).json({ error: "Failed to execute query" });
    }
  });

  // Get hint for current level
  app.post("/api/hint", async (req, res) => {
    try {
      const parsed = hintRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const { sessionId, level, hintLevel } = parsed.data;
      
      // Validate session
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const hint = await levelManager.getHint(level, hintLevel);
      if (!hint) {
        return res.status(404).json({ error: "Hint not found" });
      }

      // Update hints used counter
      await storage.updateSession(sessionId, {
        hintsUsed: session.hintsUsed + 1
      });

      res.json({ hint });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve hint" });
    }
  });

  // Level navigation
  app.post("/api/level/navigate", async (req, res) => {
    try {
      const parsed = levelProgressSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const { sessionId, level, action, targetLevel } = parsed.data;
      
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      let newLevel = level;
      
      switch (action) {
        case 'next':
          newLevel = Math.min(level + 1, 100);
          break;
        case 'previous':
          newLevel = Math.max(level - 1, 1);
          break;
        case 'jump':
          if (targetLevel && targetLevel >= 1 && targetLevel <= 100) {
            newLevel = targetLevel;
          }
          break;
        case 'reset':
          // Reset current level - no level change
          break;
      }

      const updatedSession = await storage.updateSession(sessionId, {
        currentLevel: newLevel
      });

      res.json({ session: updatedSession });
    } catch (error) {
      res.status(500).json({ error: "Failed to navigate levels" });
    }
  });

  // Get all levels for dropdown
  app.get("/api/levels", async (req, res) => {
    try {
      const levels = await storage.getAllLevels();
      const levelList = levels.map(level => ({
        id: level.id,
        title: level.title,
        difficulty: level.difficulty
      }));
      
      res.json({ levels: levelList });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve levels" });
    }
  });

  // AI Mentor: Ask Gemini
  app.post("/api/ask", async (req, res) => {
    try {
      const parsed = aiAskSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const { question, levelId, currentQuery } = parsed.data;
      const content = `You are a helpful SQL mentor for a SQL levels game.\nQuestion: ${question}\n` +
        (levelId ? `Level: ${levelId}\n` : "") +
        (currentQuery ? `Current Query: ${currentQuery}\n` : "") +
        `Respond concisely with steps and a tiny example, do not give the full solution unless asked.`;

      const apiKey = process.env.GEMINI_API_KEY || "";
      if (!apiKey) {
        return res.status(500).json({ error: "AI is not configured" });
      }

      const model = "gemini-2.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: content }] }]
        })
      });
      const json = await resp.json();
      if (!resp.ok) {
        return res.status(500).json({ error: json?.error?.message || "Gemini error" });
      }
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "No answer";
      res.json({ answer: text });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message || "AI request failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
