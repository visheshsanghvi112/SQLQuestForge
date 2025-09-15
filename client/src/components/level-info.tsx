import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Table, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Level } from "@shared/schema";

interface LevelInfoProps {
  level: Level;
}

export default function LevelInfo({ level }: LevelInfoProps) {
  const [showSchema, setShowSchema] = useState(true);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-secondary text-secondary-foreground';
      case 'Intermediate': return 'bg-accent text-accent-foreground';
      case 'Advanced': return 'bg-chart-4 text-white';
      case 'Expert': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="shadow-sm" data-testid="card-level-info">
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2" data-testid="text-level-title">
              {level.title}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Badge className={getDifficultyColor(level.difficulty)} data-testid="badge-difficulty">
                {level.difficulty.toUpperCase()}
              </Badge>
              <span data-testid="text-dataset-info">
                <Database className="h-4 w-4 mr-1 inline" />
                {level.tables.length} tables
              </span>
              <span data-testid="text-row-count">
                <Table className="h-4 w-4 mr-1 inline" />
                {level.tables.reduce((total, table) => total + table.data.length, 0)} rows
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSchema(!showSchema)}
            data-testid="button-toggle-schema"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="prose max-w-none">
          {level.story && (
            <p className="text-foreground leading-relaxed mb-3" data-testid="text-level-story">
              {level.story}
            </p>
          )}
          <p className="text-muted-foreground mb-4" data-testid="text-level-description">
            {level.description}
          </p>

          {level.objectives && level.objectives.length > 0 && (
            <div className="mb-4" data-testid="objectives-list">
              <h4 className="font-semibold text-foreground mb-2">Objectives</h4>
              <ul className="list-disc list-inside space-y-1">
                {level.objectives.map((obj, i) => (
                  <li key={i} className="text-foreground">{obj}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Database Schema Preview */}
          {showSchema && (
            <div className="bg-muted/30 border border-border rounded-md p-4" data-testid="schema-preview">
              <h4 className="font-semibold mb-2 text-foreground">Available Tables:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {level.tables.map((table, index) => (
                  <div key={table.name} data-testid={`table-schema-${index}`}>
                    <div className="font-mono font-medium text-primary mb-1">
                      {table.name}
                    </div>
                    <div className="text-muted-foreground space-y-1">
                      {Object.entries(table.schema).map(([columnName, columnType]) => (
                        <div key={columnName} data-testid={`column-${table.name}-${columnName}`}>
                          • {columnName} ({columnType})
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
