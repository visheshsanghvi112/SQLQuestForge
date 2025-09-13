import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, RotateCcw, HelpCircle, Info } from "lucide-react";
import ReferenceGuide from "./reference-guide";

interface GameFooterProps {
  currentLevel: number;
  onNavigate: (action: 'previous' | 'next' | 'jump' | 'reset', targetLevel?: number) => void;
}

export default function GameFooter({ currentLevel, onNavigate }: GameFooterProps) {
  const handleLevelSelect = (value: string) => {
    const targetLevel = parseInt(value);
    if (targetLevel !== currentLevel) {
      onNavigate('jump', targetLevel);
    }
  };

  return (
    <footer className="bg-card border-t border-border mt-auto" data-testid="game-footer">
      {/* SQL Reference Guide */}
      <ReferenceGuide />

      {/* Navigation and Actions */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* Level Navigation */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('previous')}
              disabled={currentLevel <= 1}
              data-testid="button-previous-level"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Level</span>
              <Select value={currentLevel.toString()} onValueChange={handleLevelSelect}>
                <SelectTrigger className="w-48" data-testid="select-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 100 }, (_, i) => i + 1).map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {level} - Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('next')}
              disabled={currentLevel >= 100}
              data-testid="button-next-level"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Help and Info */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('reset')}
              data-testid="button-reset-level"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Level
            </Button>
            
            <Button variant="ghost" size="sm" data-testid="button-help">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
            
            <Button variant="ghost" size="sm" data-testid="button-about">
              <Info className="h-4 w-4 mr-2" />
              About
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
