import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import type { GameSession, Level, QueryResult, QueryExecution, HintRequest, LevelProgress } from "@shared/schema";

export function useSQLGame() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Get session data
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/session", sessionId],
    enabled: !!sessionId,
  }) as { data?: { session: GameSession } | undefined, isLoading: boolean };

  // Get current level data
  const { data: levelData, isLoading: levelLoading } = useQuery({
    queryKey: ["/api/level", sessionData?.session?.currentLevel],
    enabled: !!sessionData?.session?.currentLevel,
  }) as { data?: { level: Level } | undefined, isLoading: boolean };

  // Get latest query result
  const { data: queryResultData } = useQuery({
    queryKey: ["/api/result", sessionId],
    enabled: !!sessionId,
  }) as { data?: { result: QueryResult } | undefined };

  // Initialize session mutation
  const initSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/session");
      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.session.id);
      toast({
        title: "Welcome to SQL Mastery Challenge!",
        description: "Your learning session has started.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Execute query mutation
  const executeQueryMutation = useMutation({
    mutationFn: async (query: string) => {
      if (!sessionId || !sessionData?.session) {
        throw new Error("No active session");
      }

      const queryData: QueryExecution = {
        sessionId,
        level: sessionData.session.currentLevel,
        query: query.trim(),
      };

      const response = await apiRequest("POST", "/api/execute", queryData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["/api/result", sessionId] });
      
      const result: QueryResult = data.result;
      
      if (result.success && result.isCorrect) {
        toast({
          title: "Excellent!",
          description: `Query correct! +${result.scoreEarned} points`,
        });
      } else if (result.success && !result.isCorrect) {
        toast({
          title: "Query Executed",
          description: "Results don't match expected output. Try again!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "SQL Error",
          description: result.error || "Query failed to execute",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Execution Error",
        description: error.message || "Failed to execute query",
        variant: "destructive",
      });
    },
  });

  // Get hint mutation
  const getHintMutation = useMutation({
    mutationFn: async (hintLevel: number) => {
      if (!sessionId || !sessionData?.session) {
        throw new Error("No active session");
      }

      const hintData: HintRequest = {
        sessionId,
        level: sessionData.session.currentLevel,
        hintLevel,
      };

      const response = await apiRequest("POST", "/api/hint", hintData);
      return response.json();
    },
    onSuccess: (data) => {
      setHints(prev => [...prev, data.hint]);
      queryClient.invalidateQueries({ queryKey: ["/api/session", sessionId] });
      
      toast({
        title: "Hint Available",
        description: `Hint ${hints.length + 1} added. This may reduce your score.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get hint. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Level navigation mutation
  const navigateLevelMutation = useMutation({
    mutationFn: async ({ action, targetLevel }: { action: 'previous' | 'next' | 'jump' | 'reset', targetLevel?: number }) => {
      if (!sessionId || !sessionData?.session) {
        throw new Error("No active session");
      }

      const navigationData: LevelProgress = {
        sessionId,
        level: sessionData.session.currentLevel,
        action,
        targetLevel,
      };

      const response = await apiRequest("POST", "/api/level/navigate", navigationData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["/api/level"] });
      
      // Reset hints and query when navigating
      setHints([]);
      setCurrentQuery("");
      
      if (variables.action === 'reset') {
        toast({
          title: "Level Reset",
          description: "Level progress has been reset.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Navigation Error",
        description: "Failed to navigate levels. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Exported functions
  const initializeSession = useCallback(() => {
    if (!sessionId) {
      initSessionMutation.mutate();
    }
  }, [sessionId, initSessionMutation]);

  const executeQuery = useCallback((query: string) => {
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a SQL query to execute.",
        variant: "destructive",
      });
      return;
    }
    executeQueryMutation.mutate(query);
  }, [executeQueryMutation]);

  const getHint = useCallback((hintLevel: number) => {
    if (hintLevel > 3) {
      toast({
        title: "No More Hints",
        description: "You've used all available hints for this level.",
        variant: "destructive",
      });
      return;
    }
    getHintMutation.mutate(hintLevel);
  }, [getHintMutation]);

  const navigateLevel = useCallback((action: 'previous' | 'next' | 'jump' | 'reset', targetLevel?: number) => {
    navigateLevelMutation.mutate({ action, targetLevel });
  }, [navigateLevelMutation]);

  return {
    // Data
    session: sessionData?.session as GameSession | undefined,
    currentLevel: levelData?.level as Level | undefined,
    queryResult: queryResultData?.result as QueryResult | undefined,
    hints,
    currentQuery,
    
    // Loading states
    isLoading: sessionLoading || levelLoading || executeQueryMutation.isPending || 
               getHintMutation.isPending || navigateLevelMutation.isPending || initSessionMutation.isPending,
    
    // Actions
    initializeSession,
    executeQuery,
    getHint,
    navigateLevel,
    setCurrentQuery,
  };
}
