import { z } from "zod";

// Game Session Schema
export const gameSessionSchema = z.object({
  id: z.string(),
  currentLevel: z.number().min(1).max(100),
  score: z.number().min(0),
  hintsUsed: z.number().min(0),
  startTime: z.date(),
  lastActivity: z.date(),
});

export type GameSession = z.infer<typeof gameSessionSchema>;

// Level Schema
export const levelSchema = z.object({
  id: z.number().min(1).max(100),
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
  story: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  starterQuery: z.string().optional(),
  tables: z.array(z.object({
    name: z.string(),
    schema: z.record(z.string()),
    data: z.array(z.record(z.any())),
  })),
  expectedResult: z.array(z.record(z.any())),
  hints: z.array(z.string()).min(1).max(3),
  maxScore: z.number(),
  timeLimit: z.number().optional(),
});

export type Level = z.infer<typeof levelSchema>;

// AI Mentor request/response
export const aiAskSchema = z.object({
  question: z.string().min(1),
  levelId: z.number().min(1).max(100).optional(),
  currentQuery: z.string().optional(),
});
export type AIAsk = z.infer<typeof aiAskSchema>;

// Query Execution Schema
export const queryExecutionSchema = z.object({
  sessionId: z.string(),
  level: z.number(),
  query: z.string(),
});

export type QueryExecution = z.infer<typeof queryExecutionSchema>;

// Query Result Schema
export const queryResultSchema = z.object({
  success: z.boolean(),
  data: z.array(z.record(z.any())).optional(),
  error: z.string().optional(),
  executionTime: z.number(),
  isCorrect: z.boolean().optional(),
  feedback: z.string().optional(),
  scoreEarned: z.number().optional(),
});

export type QueryResult = z.infer<typeof queryResultSchema>;

// Hint Request Schema
export const hintRequestSchema = z.object({
  sessionId: z.string(),
  level: z.number(),
  hintLevel: z.number().min(1).max(3),
});

export type HintRequest = z.infer<typeof hintRequestSchema>;

// Level Progress Schema
export const levelProgressSchema = z.object({
  sessionId: z.string(),
  level: z.number(),
  action: z.enum(['next', 'previous', 'jump', 'reset']),
  targetLevel: z.number().optional(),
});

export type LevelProgress = z.infer<typeof levelProgressSchema>;
