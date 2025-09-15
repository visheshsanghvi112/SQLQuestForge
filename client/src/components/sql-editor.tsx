import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Play, Square, RotateCcw } from "lucide-react";
import Editor from "@monaco-editor/react";
import type { Level } from "@shared/schema";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { format } from "sql-formatter";

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
  level?: Level;
}

export default function SQLEditor({ value, onChange, onExecute, isExecuting, level }: SQLEditorProps) {
  const { theme } = useTheme();

  const schemaSuggestions = useMemo(() => {
    const suggestions: Array<{ label: string; kind: number; detail: string }> = [];
    if (!level) return suggestions;

    // Table names
    level.tables.forEach((t) => {
      suggestions.push({ label: t.name, kind: 7, detail: "table" });
      // Columns
      Object.keys(t.schema).forEach((col) => {
        suggestions.push({ label: col, kind: 5, detail: `${t.name} column` });
      });
    });
    return suggestions;
  }, [level]);

  const schemaIndex = useMemo(() => {
    const tables: Record<string, { columns: Record<string, string> }> = {};
    if (level) {
      for (const t of level.tables) {
        tables[t.name] = { columns: { ...t.schema } };
      }
    }
    return tables;
  }, [level]);
  const handleExecute = () => {
    onExecute();
  };

  const handleFormat = () => {
    try {
      const formatted = format(value, {
        language: 'sql',
        tabWidth: 2,
        keywordCase: 'upper',
        linesBetweenQueries: 2,
      } as any);
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
            theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
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
              // suggestions handled via completion provider
              quickSuggestions: {
                other: true,
                comments: false,
                strings: false,
              },
            }}
            onMount={(editor, monaco) => {
              editor.focus();
              // Register simple schema-aware completion provider
              monaco.languages.registerCompletionItemProvider('sql', {
                triggerCharacters: [' ', '.', '(', ','],
                provideCompletionItems: () => {
                  const keywords = [
                    'SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'GROUP', 'HAVING', 'JOIN', 'ON', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'LIMIT', 'OFFSET', 'AS', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'WITH'
                  ].map((k) => ({
                    label: k,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: k,
                  }));

                  const schemaItems = schemaSuggestions.map((s) => ({
                    label: s.label,
                    kind: s.detail.includes('table')
                      ? monaco.languages.CompletionItemKind.Class
                      : monaco.languages.CompletionItemKind.Field,
                    detail: s.detail,
                    insertText: s.label,
                  }));

                  const snippets = [
                    {
                      label: 'SELECT-FROM-WHERE',
                      detail: 'Snippet: Basic query skeleton',
                      insertText: 'SELECT ${1:*}\nFROM ${2:table}\nWHERE ${3:condition};',
                    },
                    {
                      label: 'JOIN-skeleton',
                      detail: 'Snippet: INNER JOIN pattern',
                      insertText: 'SELECT ${1:a.*}, ${2:b.*}\nFROM ${3:table_a} a\nJOIN ${4:table_b} b ON a.${5:key} = b.${6:key}\nWHERE ${7:condition};',
                    },
                    {
                      label: 'GROUP-BY-HAVING',
                      detail: 'Snippet: aggregate with HAVING',
                      insertText: 'SELECT ${1:col}, COUNT(*) AS ${2:cnt}\nFROM ${3:table}\nGROUP BY ${1:col}\nHAVING ${2:cnt} >= ${4:2};',
                    },
                    {
                      label: 'CTE-SELECT',
                      detail: 'Snippet: WITH common table expression',
                      insertText: 'WITH ${1:cte} AS (\n  SELECT ${2:*}\n  FROM ${3:table}\n)\nSELECT * FROM ${1:cte};',
                    },
                  ].map((s) => ({
                    label: s.label,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: s.insertText,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    detail: s.detail,
                    sortText: '0000' + s.label,
                  }));

                  return { suggestions: [...snippets, ...keywords, ...schemaItems] } as any;
                },
              });

              // Hover provider for table/column type info
              monaco.languages.registerHoverProvider('sql', {
                provideHover: (model, position) => {
                  const word = model.getWordAtPosition(position);
                  if (!word) return { contents: [] } as any;
                  const name = word.word;

                  // Check tables
                  if (schemaIndex[name]) {
                    const cols = Object.entries(schemaIndex[name].columns)
                      .map(([c, t]) => `- ${c}: ${t}`)
                      .join('\n');
                    return {
                      contents: [
                        { value: `**table** \`${name}\`` },
                        { value: cols || '_no columns_' },
                      ],
                    } as any;
                  }

                  // Check columns (search across tables)
                  for (const [tableName, tbl] of Object.entries(schemaIndex)) {
                    if (tbl.columns[name]) {
                      return {
                        contents: [
                          { value: `**column** \`${name}\` in \`${tableName}\`` },
                          { value: `type: \`${tbl.columns[name]}\`` },
                        ],
                      } as any;
                    }
                  }
                  return { contents: [] } as any;
                },
              });
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
