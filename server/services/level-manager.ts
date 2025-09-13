import type { Level } from "@shared/schema";
import { storage } from "../storage";

class LevelManager {
  async getLevel(levelId: number): Promise<Level | undefined> {
    return await storage.getLevel(levelId);
  }

  async getHint(levelId: number, hintLevel: number): Promise<string | undefined> {
    const level = await this.getLevel(levelId);
    if (!level || hintLevel < 1 || hintLevel > level.hints.length) {
      return undefined;
    }
    
    return level.hints[hintLevel - 1];
  }

  getDifficultyRange(level: number): string {
    if (level >= 1 && level <= 20) return 'Beginner';
    if (level >= 21 && level <= 50) return 'Intermediate';
    if (level >= 51 && level <= 80) return 'Advanced';
    if (level >= 81 && level <= 100) return 'Expert';
    return 'Unknown';
  }

  getProgressPercentage(currentLevel: number): number {
    return Math.round((currentLevel / 100) * 100);
  }
}

export const levelManager = new LevelManager();
