# SQL Mastery Challenge

## Overview

This is a full-featured SQL game platform designed to help users practice SQL queries through 100 progressively challenging levels. The game uses a React frontend with Express backend, providing an interactive learning environment where users can write and execute SQL queries against temporary in-memory databases. Each session is independent with no persistent storage, making it ideal for educational practice.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for fast development and building
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query for server state management and custom hooks for game logic
- **Routing**: Wouter for lightweight client-side routing
- **Code Editor**: Planned integration with Monaco Editor or CodeMirror for SQL syntax highlighting

### Backend Architecture
- **Framework**: Express.js with TypeScript for type safety
- **API Design**: RESTful endpoints for session management, level data, query execution, and hints
- **Database Engine**: Better SQLite3 for in-memory session databases, providing isolated SQL environments
- **Query Safety**: Sandboxed query execution with restrictions on dangerous operations
- **Session Management**: Memory-based storage with automatic cleanup for temporary game sessions

### Game Structure
- **100 Levels** divided into difficulty tiers:
  - Beginner (1-20): Basic SELECT, WHERE, ORDER BY
  - Intermediate (21-50): GROUP BY, HAVING, simple joins
  - Advanced (51-80): Multi-table joins, subqueries, aggregates
  - Expert (81-100): Window functions, CTEs, complex queries
- **Level Components**: Each level includes description, sample data, expected results, and progressive hints
- **Validation System**: Automatic query result comparison against expected outputs

### Data Management
- **Schema Definition**: Centralized type definitions using Zod for runtime validation
- **Level Data**: Static level definitions with table schemas and sample data
- **Session Isolation**: Each user session gets a fresh in-memory database instance
- **Result Validation**: Server-side comparison of query results with expected outcomes

### Security Considerations
- **Query Restrictions**: Only SELECT, INSERT, UPDATE operations allowed on session tables
- **SQL Injection Prevention**: Parameterized queries and input sanitization
- **Resource Limits**: Session timeouts and memory management for in-memory databases
- **Sandboxing**: Isolated execution environment preventing system access

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver (configured but using SQLite for development)
- **better-sqlite3**: In-memory SQLite database engine for session management
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect configuration
- **drizzle-kit**: Database schema management and migrations

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives for components
- **tailwindcss**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library for consistent iconography

### Development and Build Tools
- **vite**: Fast build tool and development server with React plugin
- **typescript**: Type checking and enhanced developer experience
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast bundling for production builds

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library for single-page application navigation

### Form Handling and Validation
- **react-hook-form**: Performant form handling with minimal re-renders
- **@hookform/resolvers**: Integration with Zod for form validation
- **zod**: Runtime type validation and schema definition

### Development Experience
- **@replit/vite-plugin-***: Replit-specific plugins for development environment integration
- **postcss**: CSS processing with Tailwind CSS integration