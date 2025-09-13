import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Play, Square, RotateCcw } from "lucide-react";
import Editor from "@monaco-editor/react";
import { format } from "sql-formatter";

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
}

export default function SQLEditor({ value, onChange, onExecute, isExecuting }: SQLEditorProps) {
  const handleExecute = () => {
    onExecute();
  };

  const handleFormat = () => {
    try {
      const formatted = format(value, {
        language: 'sql',
        indent: '  ',
        uppercase: true,
        linesBetweenQueries: 2,
      });
      onChange(formatted);
    } catch (error) {
      // If formatting fails, keep the original value
      console.warn('SQL formatting failed:', error);
    }
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
        {/* Monaco SQL Editor */}
        <div className="relative" data-testid="monaco-sql-editor">
          <Editor
            height="300px"
            language="sql"
            value={value}
            onChange={(val) => onChange(val || '')}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, Consolas, Monaco, Courier New, monospace',
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on',
              suggest: {
                enabled: true,
                showKeywords: true,
                showSnippets: true,
              },
              quickSuggestions: {
                other: true,
                comments: false,
                strings: false,
              },
            }}
            onMount={(editor) => {
              // Add SQL keywords for auto-completion
              editor.focus();
            }}
          />
        </div>
        
        {/* Query Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            {/* Execution timing will be handled by the query result component */}
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
