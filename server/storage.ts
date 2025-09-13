import { randomUUID } from "crypto";
import type { GameSession, Level, QueryResult } from "@shared/schema";

export interface IStorage {
  // Session management
  createSession(): Promise<GameSession>;
  getSession(sessionId: string): Promise<GameSession | undefined>;
  updateSession(sessionId: string, updates: Partial<GameSession>): Promise<GameSession | undefined>;
  deleteSession(sessionId: string): Promise<boolean>;
  
  // Level management
  getLevel(levelId: number): Promise<Level | undefined>;
  getAllLevels(): Promise<Level[]>;
  
  // Query results (temporary storage)
  storeQueryResult(sessionId: string, result: QueryResult): Promise<void>;
  getLatestQueryResult(sessionId: string): Promise<QueryResult | undefined>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, GameSession>;
  private levels: Map<number, Level>;
  private queryResults: Map<string, QueryResult>;

  constructor() {
    this.sessions = new Map();
    this.levels = new Map();
    this.queryResults = new Map();
    this.initializeLevels();
  }

  private initializeLevels() {
    // Initialize with sample levels - in production this would come from a data source
    const sampleLevel: Level = {
      id: 1,
      title: "Your First SELECT",
      description: "Write a SQL query to select all columns from the 'users' table.",
      difficulty: 'Beginner',
      tables: [{
        name: 'users',
        schema: {
          id: 'INTEGER',
          name: 'TEXT',
          email: 'TEXT',
          age: 'INTEGER'
        },
        data: [
          { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 28 },
          { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 34 },
          { id: 3, name: 'Carol Davis', email: 'carol@example.com', age: 25 }
        ]
      }],
      expectedResult: [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 28 },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 34 },
        { id: 3, name: 'Carol Davis', email: 'carol@example.com', age: 25 }
      ],
      hints: [
        "Use the SELECT statement to retrieve data from a table.",
        "The asterisk (*) symbol selects all columns from a table.",
        "The complete query is: SELECT * FROM users;"
      ],
      maxScore: 100
    };
    
    this.levels.set(1, sampleLevel);
  }

  async createSession(): Promise<GameSession> {
    const id = randomUUID();
    const session: GameSession = {
      id,
      currentLevel: 1,
      score: 0,
      hintsUsed: 0,
      startTime: new Date(),
      lastActivity: new Date()
    };
    
    this.sessions.set(id, session);
    return session;
  }

  async getSession(sessionId: string): Promise<GameSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async updateSession(sessionId: string, updates: Partial<GameSession>): Promise<GameSession | undefined> {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates, lastActivity: new Date() };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId);
  }

  async getLevel(levelId: number): Promise<Level | undefined> {
    return this.levels.get(levelId);
  }

  async getAllLevels(): Promise<Level[]> {
    return Array.from(this.levels.values());
  }

  async storeQueryResult(sessionId: string, result: QueryResult): Promise<void> {
    this.queryResults.set(sessionId, result);
  }

  async getLatestQueryResult(sessionId: string): Promise<QueryResult | undefined> {
    return this.queryResults.get(sessionId);
  }
}

export const storage = new MemStorage();
