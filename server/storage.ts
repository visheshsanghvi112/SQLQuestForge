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

    // Generate varied, fully playable levels 2-100
    for (let id = 2; id <= 100; id++) {
      const difficulty = id <= 20 ? 'Beginner'
        : id <= 50 ? 'Intermediate'
        : id <= 80 ? 'Advanced'
        : 'Expert';

      const mod = id % 7; // cycle patterns

      let level: Level;
      if (mod === 1) {
        // SELECT with WHERE filter
        level = {
          id,
          title: `The Gatekeeper's Filter`,
          story: `A watchman only allows items valued 200 or more into the vault.`,
          description: `Return rows from sample_table where value >= 200.`,
          objectives: [
            'Filter rows by numeric condition',
            'Return all columns',
          ],
          difficulty,
          tables: [{
            name: 'sample_table',
            schema: { id: 'INTEGER', name: 'TEXT', value: 'INTEGER' },
            data: [
              { id: 1, name: 'Item 1', value: 100 },
              { id: 2, name: 'Item 2', value: 200 },
              { id: 3, name: 'Item 3', value: 300 },
            ],
          }],
          expectedResult: [
            { id: 2, name: 'Item 2', value: 200 },
            { id: 3, name: 'Item 3', value: 300 },
          ],
          hints: [
            'Use WHERE to keep only qualifying rows.',
            'Example: SELECT * FROM t WHERE col >= 10;',
            'Apply: SELECT * FROM sample_table WHERE value >= 200;',
          ],
          maxScore: 100,
        };
      } else if (mod === 2) {
        // ORDER BY
        level = {
          id,
          title: `The Archivist's Order`,
          story: `The archivist demands the highest values displayed first.`,
          description: `Return all rows ordered by value descending.`,
          objectives: ['Sort results', 'Use DESC order'],
          difficulty,
          tables: [{
            name: 'sample_table',
            schema: { id: 'INTEGER', name: 'TEXT', value: 'INTEGER' },
            data: [
              { id: 1, name: 'Item 1', value: 100 },
              { id: 2, name: 'Item 2', value: 200 },
              { id: 3, name: 'Item 3', value: 300 },
            ],
          }],
          expectedResult: [
            { id: 3, name: 'Item 3', value: 300 },
            { id: 2, name: 'Item 2', value: 200 },
            { id: 1, name: 'Item 1', value: 100 },
          ],
          hints: [
            'ORDER BY controls sorting.',
            'Example: SELECT * FROM t ORDER BY score DESC;',
            'Apply: ... ORDER BY value DESC;',
          ],
          maxScore: 100,
        };
      } else if (mod === 3) {
        // GROUP BY + COUNT
        level = {
          id,
          title: `The Whispering Crowd`,
          story: `How many travelers from each city whisper your name?`,
          description: `Count rows per city in attendees.`,
          objectives: ['Aggregate counts', 'Group by city'],
          difficulty,
          tables: [{
            name: 'attendees',
            schema: { id: 'INTEGER', city: 'TEXT' },
            data: [
              { id: 1, city: 'Rome' },
              { id: 2, city: 'Cairo' },
              { id: 3, city: 'Rome' },
            ],
          }],
          expectedResult: [
            { city: 'Cairo', 'COUNT(*)': 1 },
            { city: 'Rome', 'COUNT(*)': 2 },
          ],
          hints: [
            'COUNT(*) with GROUP BY makes per-group totals.',
            'Example: SELECT city, COUNT(*) FROM t GROUP BY city;',
            'Use table attendees.',
          ],
          maxScore: 100,
        };
      } else if (mod === 4) {
        // JOIN
        level = {
          id,
          title: `The Twin Trails`,
          story: `Reunite orders with their customers.`,
          description: `Join orders and customers returning customer_name and order_total.`,
          objectives: ['Inner join', 'Select two columns'],
          difficulty,
          tables: [
            {
              name: 'customers',
              schema: { id: 'INTEGER', customer_name: 'TEXT' },
              data: [
                { id: 1, customer_name: 'Alice' },
                { id: 2, customer_name: 'Bob' },
              ],
            },
            {
              name: 'orders',
              schema: { id: 'INTEGER', customer_id: 'INTEGER', order_total: 'INTEGER' },
              data: [
                { id: 10, customer_id: 1, order_total: 50 },
                { id: 11, customer_id: 2, order_total: 75 },
              ],
            },
          ],
          expectedResult: [
            { customer_name: 'Alice', order_total: 50 },
            { customer_name: 'Bob', order_total: 75 },
          ],
          hints: [
            'JOIN tables on matching keys.',
            'Example: ... FROM a JOIN b ON a.id = b.a_id',
            'Apply: customers c JOIN orders o ON c.id = o.customer_id',
          ],
          maxScore: 100,
        };
      } else if (mod === 5) {
        // Subquery > average
        level = {
          id,
          title: `The Hidden Keep`,
          story: `Only patrons spending above the realm’s average may enter.`,
          description: `Return customers whose total spend exceeds average order_total.`,
          objectives: ['Subquery for AVG', 'Group and filter'],
          difficulty,
          tables: [
            {
              name: 'orders',
              schema: { id: 'INTEGER', customer: 'TEXT', total: 'INTEGER' },
              data: [
                { id: 1, customer: 'A', total: 50 },
                { id: 2, customer: 'A', total: 100 },
                { id: 3, customer: 'B', total: 40 },
              ],
            },
          ],
          expectedResult: [
            { customer: 'A' },
          ],
          hints: [
            'Compute AVG(total) in a subquery.',
            'Group by customer to SUM their totals.',
            'Filter SUM(total) > (SELECT AVG(total) FROM orders)',
          ],
          maxScore: 100,
        };
      } else if (mod === 6) {
        // HAVING
        level = {
          id,
          title: `Council of Hundreds`,
          story: `Only cities with at least 2 statues are honored.`,
          description: `Return cities with count >= 2.`,
          objectives: ['GROUP BY', 'HAVING filter'],
          difficulty,
          tables: [{
            name: 'statues',
            schema: { id: 'INTEGER', city: 'TEXT' },
            data: [
              { id: 1, city: 'Athens' },
              { id: 2, city: 'Athens' },
              { id: 3, city: 'Sparta' },
            ],
          }],
          expectedResult: [
            { city: 'Athens', 'COUNT(*)': 2 },
          ],
          hints: [
            'Use HAVING for aggregated conditions.',
            'Example: ... GROUP BY city HAVING COUNT(*) >= 2',
            'Apply to table statues.',
          ],
          maxScore: 100,
        };
      } else {
        // Window function RANK
        level = {
          id,
          title: `The Time Weaver`,
          story: `Rank deliveries by speed within each courier’s realm.`,
          description: `Return courier, delivery_id, rank by delivery_time per courier.`,
          objectives: ['RANK() OVER', 'PARTITION BY and ORDER BY'],
          difficulty,
          tables: [{
            name: 'deliveries',
            schema: { delivery_id: 'INTEGER', courier: 'TEXT', delivery_time: 'INTEGER' },
            data: [
              { delivery_id: 1, courier: 'X', delivery_time: 30 },
              { delivery_id: 2, courier: 'X', delivery_time: 20 },
              { delivery_id: 3, courier: 'Y', delivery_time: 25 },
            ],
          }],
          expectedResult: [
            { courier: 'X', delivery_id: 2, 'RANK()': 1 },
            { courier: 'X', delivery_id: 1, 'RANK()': 2 },
            { courier: 'Y', delivery_id: 3, 'RANK()': 1 },
          ],
          hints: [
            'Window functions keep rows while computing across partitions.',
            'Example: RANK() OVER (PARTITION BY team ORDER BY score DESC)',
            'Apply: PARTITION BY courier ORDER BY delivery_time ASC',
          ],
          maxScore: 100,
        };
      }

      this.levels.set(id, level);
    }
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
