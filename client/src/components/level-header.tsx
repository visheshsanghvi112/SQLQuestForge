import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Lightbulb } from "lucide-react";
import type { GameSession, Level } from "@shared/schema";

interface LevelHeaderProps {
  session: GameSession;
  currentLevel: Level;
  onGetHint: () => void;
  hintsUsed: number;
}

export default function LevelHeader({ session, currentLevel, onGetHint, hintsUsed }: LevelHeaderProps) {
  const progressPercentage = (session.currentLevel / 100) * 100;

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Game Title & Level */}
          <div className="flex items-center space-x-4">
            <Badge 
              variant="default" 
              className="level-indicator px-3 py-1 text-sm font-bold"
              data-testid="level-badge"
            >
              Level {session.currentLevel}
            </Badge>
            <h1 className="text-xl font-bold text-foreground" data-testid="game-title">
              SQL Mastery Challenge
            </h1>
          </div>

          {/* Progress Section */}
          <div className="flex items-center space-x-6">
            {/* Level Progress */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground font-medium">Progress:</span>
              <div className="w-32">
                <Progress 
                  value={progressPercentage} 
                  className="h-2"
                  data-testid="progress-bar"
                />
              </div>
              <span className="text-sm font-medium" data-testid="progress-text">
                {session.currentLevel}/100
              </span>
            </div>

            {/* Session Score */}
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium" data-testid="session-score">
                {session.score.toLocaleString()} pts
              </span>
            </div>

            {/* Timer */}
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono" data-testid="session-timer">
                {Math.floor((Date.now() - session.startTime.getTime()) / 60000).toString().padStart(2, '0')}:
                {Math.floor(((Date.now() - session.startTime.getTime()) % 60000) / 1000).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Hints Button */}
            <Button
              variant="default"
              size="sm"
              onClick={onGetHint}
              className="hint-available bg-accent hover:bg-accent/90 text-accent-foreground"
              data-testid="button-hint"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Hint ({hintsUsed}/3)
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
