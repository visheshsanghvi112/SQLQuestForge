import type { Level } from "@shared/schema";

// This would be generated or loaded from a configuration file
// For now, we'll define the structure for the 100 levels

export const generateLevel = (id: number): Level => {
  const getDifficulty = (level: number) => {
    if (level >= 1 && level <= 20) return 'Beginner' as const;
    if (level >= 21 && level <= 50) return 'Intermediate' as const;
    if (level >= 51 && level <= 80) return 'Advanced' as const;
    return 'Expert' as const;
  };

  // Sample level generation - in production this would be much more sophisticated
  const baseLevel: Level = {
    id,
    title: `Level ${id} Challenge`,
    description: `SQL challenge for level ${id}`,
    difficulty: getDifficulty(id),
    tables: [{
      name: 'sample_table',
      schema: {
        id: 'INTEGER',
        name: 'TEXT',
        value: 'INTEGER'
      },
      data: [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
        { id: 3, name: 'Item 3', value: 300 }
      ]
    }],
    expectedResult: [
      { id: 1, name: 'Item 1', value: 100 },
      { id: 2, name: 'Item 2', value: 200 },
      { id: 3, name: 'Item 3', value: 300 }
    ],
    hints: [
      "Use SELECT to retrieve data",
      "Select all columns with *",
      "The query is: SELECT * FROM sample_table"
    ],
    maxScore: 100
  };

  return baseLevel;
};

// SQL Reference content for the guide
export const sqlReference = {
  basic: [
    { command: "SELECT column FROM table", description: "Basic data retrieval" },
    { command: "WHERE condition", description: "Filter rows" },
    { command: "ORDER BY column ASC/DESC", description: "Sort results" },
    { command: "LIMIT number", description: "Restrict row count" },
  ],
  aggregates: [
    { command: "COUNT(*), COUNT(column)", description: "Count rows/values" },
    { command: "SUM(column)", description: "Sum values" },
    { command: "AVG(column)", description: "Average values" },
    { command: "GROUP BY column", description: "Group for aggregates" },
  ],
  joins: [
    { command: "INNER JOIN ON condition", description: "Matching records only" },
    { command: "LEFT JOIN ON condition", description: "All left table records" },
    { command: "RIGHT JOIN ON condition", description: "All right table records" },
  ],
  advanced: [
    { command: "ROW_NUMBER() OVER()", description: "Window functions" },
    { command: "WITH cte AS (...)", description: "Common Table Expressions" },
    { command: "EXISTS (subquery)", description: "Subquery existence" },
  ]
};

export const commonPatterns = [
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
  },
  {
    title: "Subquery for Filtering",
    code: `SELECT * FROM products
WHERE category_id IN (
  SELECT id FROM categories 
  WHERE name = 'Electronics'
)`
  },
  {
    title: "Window Function Ranking",
    code: `SELECT name, salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC) as rank
FROM employees`
  }
];
