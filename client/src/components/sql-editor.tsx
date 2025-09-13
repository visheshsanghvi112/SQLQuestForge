import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Code, Play, Square, RotateCcw } from "lucide-react";
import { useState } from "react";

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
}

export default function SQLEditor({ value, onChange, onExecute, isExecuting }: SQLEditorProps) {
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const handleExecute = () => {
    const startTime = Date.now();
    onExecute();
    // Note: In a real implementation, this would be handled by the query result
    setExecutionTime(Date.now() - startTime);
  };

  const handleFormat = () => {
    // Simple SQL formatting - in production, use a proper SQL formatter
    const formatted = value
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ',\n    ')
      .replace(/\bSELECT\b/gi, 'SELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bJOIN\b/gi, '\nJOIN')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bHAVING\b/gi, '\nHAVING');
    onChange(formatted);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <Card className="shadow-sm" data-testid="card-sql-editor">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Code className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">SQL Query Editor</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFormat}
              data-testid="button-format"
            >
              <Code className="h-4 w-4 mr-1" />
              Format
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              data-testid="button-clear"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* SQL Editor Textarea */}
        <div className="relative">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="-- Write your SQL query here
SELECT column_name 
FROM table_name 
WHERE condition;"
            className="sql-editor font-mono text-sm border-0 rounded-none resize-none"
            style={{ minHeight: '300px' }}
            data-testid="textarea-sql-query"
          />
        </div>
        
        {/* Query Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            {executionTime && (
              <span data-testid="text-execution-time">
                <span className="font-mono">{executionTime}ms</span>
              </span>
            )}
          </div>
          <Button
            onClick={handleExecute}
            disabled={isExecuting || !value.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            data-testid="button-execute"
          >
            {isExecuting ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Executing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Query
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
