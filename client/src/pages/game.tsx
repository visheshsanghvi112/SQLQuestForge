import { useEffect } from "react";
import { useSQLGame } from "@/hooks/use-sql-game";
import LevelHeader from "@/components/level-header";
import LevelInfo from "@/components/level-info";
import SQLEditor from "@/components/sql-editor";
import QueryResults from "@/components/query-results";
import FeedbackPanel from "@/components/feedback-panel";
import HintsPanel from "@/components/hints-panel";
import GameFooter from "@/components/game-footer";
import { Card } from "@/components/ui/card";
import AIMentor from "@/components/ai-mentor";

export default function Game() {
  const {
    session,
    currentLevel,
    queryResult,
    hints,
    isLoading,
    initializeSession,
    executeQuery,
    getHint,
    navigateLevel,
    currentQuery,
    setCurrentQuery
  } = useSQLGame();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  if (isLoading || !session || !currentLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-foreground">Loading SQL Mastery Challenge...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <LevelHeader 
        session={session}
        currentLevel={currentLevel}
        onGetHint={() => getHint(hints.length + 1)}
        hintsUsed={hints.length}
      />

      {/* Main Game Area */}
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        
        {/* Left Panel: Level Info & SQL Editor */}
        <div className="md:col-span-7 space-y-4 md:space-y-6">
          <LevelInfo level={currentLevel} />
          
          <SQLEditor
            value={currentQuery}
            onChange={setCurrentQuery}
            onExecute={() => executeQuery(currentQuery)}
            isExecuting={isLoading}
            level={currentLevel}
          />
        </div>

        {/* Right Panel: Results & Feedback */}
        <div className="md:col-span-5 space-y-4 md:space-y-6">
          <QueryResults result={queryResult || null} level={currentLevel} currentQuery={currentQuery} />
          <FeedbackPanel 
            result={queryResult || null}
            onNextLevel={() => navigateLevel('next')}
            onRetryLevel={() => navigateLevel('reset')}
          />
          {hints.length > 0 && <HintsPanel hints={hints} />}
          <AIMentor levelId={currentLevel.id} currentQuery={currentQuery} />
        </div>

      </main>

      {/* Footer */}
      <GameFooter 
        currentLevel={currentLevel.id}
        onNavigate={navigateLevel}
      />
    </div>
  );
}
