import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { QueryResult } from "@shared/schema";

interface QueryResultsProps {
  result: QueryResult | null;
}

export default function QueryResults({ result }: QueryResultsProps) {
  const getResultIcon = () => {
    if (!result) return <Database className="h-5 w-5 text-muted-foreground" />;
    if (!result.success) return <AlertCircle className="h-5 w-5 text-destructive" />;
    if (result.isCorrect) return <CheckCircle className="h-5 w-5 text-secondary" />;
    return <Database className="h-5 w-5 text-accent" />;
  };

  const getResultTitle = () => {
    if (!result) return "Query Results";
    if (!result.success) return "Query Error";
    if (result.isCorrect) return "Correct Results";
    return "Query Results";
  };

  return (
    <Card className="shadow-sm" data-testid="card-query-results">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getResultIcon()}
            <span className="font-medium text-foreground" data-testid="text-results-title">
              {getResultTitle()}
            </span>
          </div>
          {result?.data && (
            <span className="text-sm text-muted-foreground" data-testid="text-row-count">
              {result.data.length} rows returned
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!result && (
          <div className="text-center py-8 text-muted-foreground" data-testid="empty-results">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Execute a query to see results</p>
          </div>
        )}

        {result && !result.success && (
          <Alert variant="destructive" data-testid="error-alert">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription data-testid="text-error-message">
              {result.error}
            </AlertDescription>
          </Alert>
        )}

        {result?.success && result.data && result.data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground" data-testid="no-results">
            <p>Query executed successfully but returned no results</p>
          </div>
        )}

        {result?.success && result.data && result.data.length > 0 && (
          <div className="overflow-x-auto" data-testid="results-table-container">
            <Table className="result-table">
              <TableHeader>
                <TableRow>
                  {Object.keys(result.data[0]).map((column) => (
                    <TableHead key={column} data-testid={`column-header-${column}`}>
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((row, rowIndex) => (
                  <TableRow key={rowIndex} data-testid={`row-${rowIndex}`}>
                    {Object.entries(row).map(([column, value], cellIndex) => (
                      <TableCell 
                        key={`${rowIndex}-${column}`} 
                        className={typeof value === 'number' ? 'text-right font-mono' : ''}
                        data-testid={`cell-${rowIndex}-${cellIndex}`}
                      >
                        {value === null ? (
                          <span className="text-muted-foreground italic">NULL</span>
                        ) : (
                          String(value)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
