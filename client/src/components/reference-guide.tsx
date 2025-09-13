import { Card, CardContent } from "@/components/ui/card";
import { Book, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function ReferenceGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  const sqlReference = [
    {
      category: "Basic Queries",
      color: "bg-primary text-primary-foreground",
      items: [
        { command: "SELECT column FROM table", description: "Basic data retrieval" },
        { command: "WHERE condition", description: "Filter rows" },
        { command: "ORDER BY column ASC/DESC", description: "Sort results" },
        { command: "LIMIT number", description: "Restrict row count" },
      ]
    },
    {
      category: "Aggregates",
      color: "bg-secondary text-secondary-foreground",
      items: [
        { command: "COUNT(*), COUNT(column)", description: "Count rows/values" },
        { command: "SUM(column)", description: "Sum values" },
        { command: "AVG(column)", description: "Average values" },
        { command: "GROUP BY column", description: "Group for aggregates" },
      ]
    },
    {
      category: "Table Joins",
      color: "bg-accent text-accent-foreground",
      items: [
        { command: "INNER JOIN ON condition", description: "Matching records only" },
        { command: "LEFT JOIN ON condition", description: "All left table records" },
        { command: "RIGHT JOIN ON condition", description: "All right table records" },
      ]
    },
    {
      category: "Advanced",
      color: "bg-chart-4 text-white",
      items: [
        { command: "ROW_NUMBER() OVER()", description: "Window functions" },
        { command: "WITH cte AS (...)", description: "Common Table Expressions" },
        { command: "EXISTS (subquery)", description: "Subquery existence" },
      ]
    }
  ];

  const quickExamples = [
    {
      title: "Find Top N Records",
      code: `SELECT * FROM table
ORDER BY column DESC
LIMIT 10`
    },
    {
      title: "Join with Aggregation",
      code: `SELECT c.name, COUNT(o.id)
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name`
    }
  ];

  return (
    <div className="border-b border-border" data-testid="reference-guide">
      <Button
        variant="ghost"
        className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-muted/30"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="button-toggle-reference"
      >
        <div className="flex items-center space-x-3">
          <Book className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">SQL Reference Guide</span>
          <Badge variant="secondary" className="text-xs">
            Quick Help
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-6 bg-muted/10" data-testid="reference-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sqlReference.map((section, sectionIndex) => (
              <div key={section.category} className="space-y-3" data-testid={`reference-section-${sectionIndex}`}>
                <h4 className={`font-semibold border-b pb-1 ${section.color}`}>
                  {section.category}
                </h4>
                <div className="space-y-2 text-sm">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} data-testid={`reference-item-${sectionIndex}-${itemIndex}`}>
                      <div className="font-mono text-xs bg-card border rounded p-2 mb-1">
                        {item.command}
                      </div>
                      <div className="text-muted-foreground">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Examples Section */}
          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-3">Common Query Patterns</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
              {quickExamples.map((example, index) => (
                <Card key={index} className="p-3" data-testid={`example-${index}`}>
                  <div className="font-medium text-foreground mb-2">{example.title}</div>
                  <pre className="font-mono text-xs bg-muted/50 p-2 rounded whitespace-pre-wrap">
                    {example.code}
                  </pre>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
