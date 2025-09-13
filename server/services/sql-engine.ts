import Database from "better-sqlite3";
import type { Level, QueryResult } from "@shared/schema";
import { levelManager } from "./level-manager";

class SQLEngine {
  private databases: Map<string, Database.Database>;

  constructor() {
    this.databases = new Map();
  }

  private getOrCreateDatabase(sessionId: string, level: Level): Database.Database {
    const dbKey = `${sessionId}-${level.id}`;
    let db = this.databases.get(dbKey);
    
    if (!db) {
      // Create in-memory SQLite database
      db = new Database(':memory:');
      
      // Setup tables for this level
      this.setupLevelTables(db, level);
      
      this.databases.set(dbKey, db);
      
      // Auto-cleanup after 1 hour of inactivity
      setTimeout(() => {
        this.cleanupDatabase(dbKey);
      }, 60 * 60 * 1000);
    }
    
    return db;
  }

  private setupLevelTables(db: Database.Database, level: Level): void {
    for (const table of level.tables) {
      // Create table schema
      const columns = Object.entries(table.schema)
        .map(([name, type]) => `${name} ${type}`)
        .join(', ');
      
      const createTableSQL = `CREATE TABLE ${table.name} (${columns})`;
      db.exec(createTableSQL);
      
      // Insert data
      if (table.data.length > 0) {
        const columnNames = Object.keys(table.data[0]);
        const placeholders = columnNames.map(() => '?').join(', ');
        const insertSQL = `INSERT INTO ${table.name} (${columnNames.join(', ')}) VALUES (${placeholders})`;
        
        const insertStmt = db.prepare(insertSQL);
        
        for (const row of table.data) {
          const values = columnNames.map(col => row[col]);
          insertStmt.run(values);
        }
      }
    }
  }

  private cleanupDatabase(dbKey: string): void {
    const db = this.databases.get(dbKey);
    if (db) {
      db.close();
      this.databases.delete(dbKey);
    }
  }

  private sanitizeQuery(query: string): { isValid: boolean; error?: string } {
    const trimmedQuery = query.trim().toLowerCase();
    
    // Block dangerous operations
    const dangerousPatterns = [
      /drop\s+database/,
      /drop\s+table/,
      /alter\s+table/,
      /create\s+table/,
      /delete\s+from/,
      /truncate/,
      /pragma/,
      /attach/,
      /detach/
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmedQuery)) {
        return {
          isValid: false,
          error: "Query contains forbidden operations. Only SELECT, INSERT, and UPDATE are allowed."
        };
      }
    }
    
    // Must start with SELECT for most levels (basic validation)
    if (!trimmedQuery.startsWith('select') && !trimmedQuery.startsWith('with')) {
      return {
        isValid: false,
        error: "Query must start with SELECT or WITH statement."
      };
    }
    
    return { isValid: true };
  }

  private compareResults(actual: any[], expected: any[]): boolean {
    if (actual.length !== expected.length) {
      return false;
    }
    
    // Sort both arrays for comparison (order might not matter for some queries)
    const sortedActual = actual.slice().sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    const sortedExpected = expected.slice().sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    
    for (let i = 0; i < sortedActual.length; i++) {
      const actualRow = sortedActual[i];
      const expectedRow = sortedExpected[i];
      
      if (JSON.stringify(actualRow) !== JSON.stringify(expectedRow)) {
        return false;
      }
    }
    
    return true;
  }

  async executeQuery(sessionId: string, levelId: number, query: string): Promise<QueryResult> {
    const startTime = Date.now();
    
    try {
      // Get level details
      const level = await levelManager.getLevel(levelId);
      if (!level) {
        return {
          success: false,
          error: "Invalid level",
          executionTime: Date.now() - startTime,
          isCorrect: false
        };
      }
      
      // Validate query safety
      const validation = this.sanitizeQuery(query);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          executionTime: Date.now() - startTime,
          isCorrect: false
        };
      }
      
      // Get or create database for this session/level
      const db = this.getOrCreateDatabase(sessionId, level);
      
      // Execute query
      let results: any[];
      try {
        const stmt = db.prepare(query);
        results = stmt.all();
      } catch (sqlError: any) {
        return {
          success: false,
          error: `SQL Error: ${sqlError.message}`,
          executionTime: Date.now() - startTime,
          isCorrect: false
        };
      }
      
      // Check if results match expected output
      const isCorrect = this.compareResults(results, level.expectedResult);
      
      let scoreEarned = 0;
      let feedback = "";
      
      if (isCorrect) {
        scoreEarned = level.maxScore;
        feedback = "Excellent! Your query returned the correct results.";
      } else {
        feedback = `Query executed successfully but results don't match expected output. Expected ${level.expectedResult.length} rows, got ${results.length} rows.`;
      }
      
      return {
        success: true,
        data: results,
        executionTime: Date.now() - startTime,
        isCorrect,
        feedback,
        scoreEarned
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: `System error: ${error.message}`,
        executionTime: Date.now() - startTime,
        isCorrect: false
      };
    }
  }

  // Cleanup all databases for a session
  cleanupSession(sessionId: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key, db] of this.databases.entries()) {
      if (key.startsWith(`${sessionId}-`)) {
        db.close();
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.databases.delete(key));
  }
}

export const sqlEngine = new SQLEngine();
