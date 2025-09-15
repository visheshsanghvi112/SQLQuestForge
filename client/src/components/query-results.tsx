import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { QueryResult, Level } from "@shared/schema";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QueryResultsProps {
  result: QueryResult | null;
  level?: Level;
  currentQuery?: string;
}

export default function QueryResults({ result, level, currentQuery }: QueryResultsProps) {
  const [pageSize, setPageSize] = useState<number>(25);
  const [page, setPage] = useState<number>(1);
  const [view, setView] = useState<'results' | 'tables'>('results');
  const [resultsSubView, setResultsSubView] = useState<'data' | 'schema' | 'json' | 'expected'>('data');
  const cardRef = useRef<HTMLDivElement | null>(null);

  // After each successful execute, jump to results view
  useEffect(() => {
    if (result) {
      setView('results');
      setResultsSubView('data');
      // Smooth scroll results into view on mobile
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    }
  }, [result]);

  const totalRows = result?.data?.length ?? 0;
  const totalPages = useMemo(() => (totalRows > 0 ? Math.ceil(totalRows / pageSize) : 1), [totalRows, pageSize]);
  const pageData = useMemo(() => {
    if (!result?.data || result.data.length === 0) return [] as any[];
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return result.data.slice(start, end);
  }, [result, page, pageSize]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const onChangePageSize = (val: string) => {
    const size = parseInt(val, 10);
    setPageSize(size);
    setPage(1);
  };

  const columns = useMemo(() => {
    const rows = result?.data ?? [];
    if (rows.length === 0) return [] as string[];
    return Object.keys(rows[0] as Record<string, unknown>);
  }, [result?.data]);

  type ColMeta = { name: string; type: string; nulls: number; unique: number; sample: string };
  const columnMeta = useMemo<ColMeta[]>(() => {
    const rows = result?.data ?? [];
    if (rows.length === 0) return [];
    return columns.map((col) => {
      let nulls = 0;
      const uniques = new Set<string>();
      let detected: string | null = null;
      const sampleVals: string[] = [];
      for (const row of rows) {
        const v = (row as any)[col];
        if (v === null || v === undefined) {
          nulls++;
          continue;
        }
        const vt = typeof v;
        if (!detected) detected = vt;
        else if (detected !== vt) detected = 'mixed';
        const sv = String(v);
        uniques.add(sv);
        if (sampleVals.length < 3 && !sampleVals.includes(sv)) sampleVals.push(sv);
      }
      const typeLabel = detected || 'unknown';
      return { name: col, type: typeLabel, nulls, unique: uniques.size, sample: sampleVals.join(', ') };
    });
  }, [columns, result]);

  const toCSV = () => {
    if (!result?.data || result.data.length === 0) return '';
    const head = columns.join(',');
    const rows = result.data.map((row) => columns.map((c) => {
      const val = (row as any)[c];
      if (val === null || val === undefined) return '';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    }).join(','));
    return [head, ...rows].join('\n');
  };

  const copyCSV = async () => {
    const csv = toCSV();
    if (!csv) return;
    await navigator.clipboard.writeText(csv);
  };

  const createTableSQL = useMemo(() => {
    if (columnMeta.length === 0) return '';
    const mapType = (t: string) => t === 'number' ? 'INTEGER' : t === 'boolean' ? 'BOOLEAN' : 'TEXT';
    const cols = columnMeta.map((m) => `  ${m.name} ${mapType(m.type)}`).join(',\n');
    return `CREATE TABLE result_${Date.now()} (\n${cols}\n);`;
  }, [columnMeta]);

  const copyCreateTable = async () => {
    if (!createTableSQL) return;
    await navigator.clipboard.writeText(createTableSQL);
  };
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
    <Card ref={cardRef} className="shadow-sm" data-testid="card-query-results">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getResultIcon()}
            <span className="font-medium text-foreground" data-testid="text-results-title">
              {getResultTitle()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {level && (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant={view === 'results' ? 'default' : 'ghost'} size="sm" onClick={() => setView('results')}>Results</Button>
                <Button variant={view === 'tables' ? 'default' : 'ghost'} size="sm" onClick={() => setView('tables')}>Tables</Button>
              </div>
            )}
            {view === 'results' && (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2">
                  <Button variant={resultsSubView === 'data' ? 'default' : 'ghost'} size="sm" onClick={() => setResultsSubView('data')}>Data</Button>
                  <Button variant={resultsSubView === 'schema' ? 'default' : 'ghost'} size="sm" onClick={() => setResultsSubView('schema')}>Schema</Button>
                  {level?.expectedResult && level.expectedResult.length > 0 && (
                    <Button variant={resultsSubView === 'expected' ? 'default' : 'ghost'} size="sm" onClick={() => setResultsSubView('expected')}>Expected</Button>
                  )}
                  <Button variant={resultsSubView === 'json' ? 'default' : 'ghost'} size="sm" onClick={() => setResultsSubView('json')}>JSON</Button>
                </div>
                {resultsSubView === 'data' && result?.data && (
                  <span className="text-sm text-muted-foreground" data-testid="text-row-count">
                    {totalRows} rows
                  </span>
                )}
                <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Rows per page</span>
                  <Select value={String(pageSize)} onValueChange={onChangePageSize}>
                    <SelectTrigger className="h-7 w-[72px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[25, 50, 100].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Query summary row */}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {typeof result?.executionTime === 'number' && (
            <span>Time: {result.executionTime} ms</span>
          )}
          {typeof result?.scoreEarned === 'number' && (
            <span>Score: {result.scoreEarned}</span>
          )}
          {typeof result?.isCorrect === 'boolean' && (
            <span className={result.isCorrect ? 'text-secondary' : 'text-accent'}>
              {result.isCorrect ? 'Correct' : 'Not Correct'}
            </span>
          )}
          {currentQuery && (
            <span className="truncate max-w-full md:max-w-[60%]" title={currentQuery}>
              Query: <span className="font-mono text-foreground">{currentQuery}</span>
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {view === 'results' && !result && (
          <div className="text-center py-8 text-muted-foreground" data-testid="empty-results">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Execute a query to see results</p>
          </div>
        )}

        {view === 'results' && result && !result.success && (
          <Alert variant="destructive" data-testid="error-alert">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription data-testid="text-error-message">
              {result.error}
            </AlertDescription>
          </Alert>
        )}

        {view === 'results' && result?.success && result.data && result.data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground" data-testid="no-results">
            <p>Query executed successfully but returned no results</p>
          </div>
        )}

        {view === 'results' && resultsSubView === 'data' && result?.success && result.data && result.data.length > 0 && (
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
              <TableBody className="max-h-96 overflow-y-auto">
                {pageData.map((row, rowIndex) => (
                  <TableRow key={`${page}-${rowIndex}`} data-testid={`row-${rowIndex}`}>
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
            {/* Pagination controls */}
            {totalRows > pageSize && (
              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <span>
                  Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalRows)} of {totalRows}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={goPrev} disabled={page === 1}>Prev</Button>
                  <span className="min-w-[4rem] text-center">Page {page}/{totalPages}</span>
                  <Button variant="ghost" size="sm" onClick={goNext} disabled={page === totalPages}>Next</Button>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 mt-3">
              <Button variant="ghost" size="sm" onClick={copyCSV}>Copy CSV</Button>
              {createTableSQL && <Button variant="ghost" size="sm" onClick={copyCreateTable}>Copy CREATE TABLE</Button>}
            </div>
          </div>
        )}

        {view === 'results' && resultsSubView === 'schema' && columnMeta.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>NULLs</TableHead>
                  <TableHead>Unique</TableHead>
                  <TableHead>Sample</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columnMeta.map((m) => (
                  <TableRow key={m.name}>
                    <TableCell className="font-mono">{m.name}</TableCell>
                    <TableCell className="uppercase text-muted-foreground">{m.type}</TableCell>
                    <TableCell className="text-right">{m.nulls}</TableCell>
                    <TableCell className="text-right">{m.unique}</TableCell>
                    <TableCell className="truncate max-w-[240px]" title={m.sample}>{m.sample || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {createTableSQL && (
              <div className="mt-3">
                <pre className="text-xs bg-muted/30 p-3 rounded-md overflow-auto">{createTableSQL}</pre>
                <Button variant="ghost" size="sm" onClick={copyCreateTable} className="mt-2">Copy CREATE TABLE</Button>
              </div>
            )}
          </div>
        )}

        {view === 'results' && resultsSubView === 'expected' && level?.expectedResult && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(level.expectedResult[0] || {}).map((c) => (
                    <TableHead key={c}>{c}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {level.expectedResult.slice(0, 100).map((row, i) => (
                  <TableRow key={i}>
                    {Object.keys(level.expectedResult[0] || {}).map((c) => (
                      <TableCell key={`${i}-${c}`}>{(row as any)[c] as any}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {result?.success && result?.data && (
              <div className="mt-2 text-xs text-muted-foreground">
                Expected rows: {level.expectedResult.length} • Your rows: {result.data.length}
              </div>
            )}
          </div>
        )}

        {view === 'results' && resultsSubView === 'json' && result?.data && (
          <pre className="text-xs bg-muted/30 p-3 rounded-md overflow-auto max-h-96">{JSON.stringify(result.data, null, 2)}</pre>
        )}

        {view === 'tables' && level && (
          <div className="space-y-6">
            {level.tables.map((t, ti) => (
              <div key={t.name}>
                <div className="mb-2 text-sm text-muted-foreground">Table: <span className="font-mono text-foreground">{t.name}</span> • {t.data.length} rows</div>
                <div className="overflow-x-auto max-h-80 border border-border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(t.schema).map((col) => (
                          <TableHead key={col}>{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {t.data.slice(0, 50).map((row, ri) => (
                        <TableRow key={`${ti}-${ri}`}>
                          {Object.keys(t.schema).map((col) => (
                            <TableCell key={`${ti}-${ri}-${col}`} className={typeof (row as any)[col] === 'number' ? 'text-right font-mono' : ''}>
                              {(row as any)[col] === null ? (
                                <span className="text-muted-foreground italic">NULL</span>
                              ) : (
                                String((row as any)[col])
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
