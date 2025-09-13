import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, ArrowRight, RotateCcw, Trophy, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { QueryResult } from "@shared/schema";

interface FeedbackPanelProps {
  result: QueryResult | null;
  onNextLevel: () => void;
  onRetryLevel: () => void;
}

export default function FeedbackPanel({ result, onNextLevel, onRetryLevel }: FeedbackPanelProps) {
  if (!result) return null;

  const isSuccess = result.success && result.isCorrect;
  const isError = !result.success;

  return (
    <Card className="shadow-sm" data-testid="card-feedback">
      <CardHeader>
        <div className="flex items-center space-x-2">
          {isSuccess && <CheckCircle className="h-5 w-5 text-secondary" />}
          {isError && <AlertCircle className="h-5 w-5 text-destructive" />}
          {result.success && !result.isCorrect && <AlertCircle className="h-5 w-5 text-accent" />}
          <span className="font-medium text-foreground" data-testid="text-feedback-title">
            Query Feedback
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Feedback Message */}
        {isSuccess && (
          <Alert className="border-secondary/20 bg-secondary/10" data-testid="success-feedback">
            <CheckCircle className="h-4 w-4 text-secondary" />
            <AlertDescription className="text-foreground">
              <div className="font-medium mb-1">Excellent! Query executed successfully.</div>
              <div className="text-sm text-muted-foreground">
                {result.feedback || "Your query returned the correct results."}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isError && (
          <Alert variant="destructive" data-testid="error-feedback">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription data-testid="text-error-feedback">
              {result.error}
            </AlertDescription>
          </Alert>
        )}

        {result.success && !result.isCorrect && (
          <Alert className="border-accent/20 bg-accent/10" data-testid="incorrect-feedback">
            <AlertCircle className="h-4 w-4 text-accent" />
            <AlertDescription className="text-foreground">
              <div className="font-medium mb-1">Query executed but results are incorrect.</div>
              <div className="text-sm text-muted-foreground">
                {result.feedback || "Please check your query and try again."}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Performance Stats */}
        {result.success && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-muted/30 rounded-md p-3" data-testid="execution-time-stat">
              <div className="text-muted-foreground mb-1 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Execution Time
              </div>
              <div className="font-mono font-medium text-foreground">
                {result.executionTime}ms
              </div>
            </div>
            {result.scoreEarned !== undefined && (
              <div className="bg-muted/30 rounded-md p-3" data-testid="score-earned-stat">
                <div className="text-muted-foreground mb-1 flex items-center">
                  <Trophy className="h-4 w-4 mr-1" />
                  Score Earned
                </div>
                <div className="font-medium text-secondary">
                  +{result.scoreEarned} pts
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          {isSuccess && (
            <Button
              onClick={onNextLevel}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              data-testid="button-next-level"
            >
              <span>Next Level</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={onRetryLevel}
            data-testid="button-retry"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
