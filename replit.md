# BoomWheel - Quote Application

## Overview

BoomWheel is a modern full-stack web application for discovering, sharing, and managing inspirational quotes. The application features a React frontend with a Node.js Express backend, utilizing PostgreSQL for data persistence. Users can browse quotes by category, view daily quotes, manage favorites, and share quotes across social platforms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: Express sessions with PostgreSQL storage
- **Development**: Hot reloading with Vite middleware integration

### Database Design
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Tables**:
  - `quotes`: Stores quote text, author, category, and source
  - `favorites`: Stores user favorite quotes with full quote data as JSONB

## Key Components

### Quote Management System
- **Quote Sources**: 
  - Built-in seed quotes for initial content
  - External API integration (Quotable.io) for expanded quote collection
  - Automatic mapping between external and internal quote formats
- **Categories**: Motivational, wisdom, funny, success, life quotes
- **Daily Quote Feature**: Deterministic daily quote selection based on date seed

### User Interface Components
- **DailyQuoteHero**: Featured daily quote with gradient background
- **CategoryFilters**: Interactive category selection and random quote generation
- **QuotesGrid**: Responsive grid layout for quote browsing
- **QuoteCard**: Individual quote display with favorite/share actions
- **ShareModal**: Social media sharing integration
- **MobileNav**: Responsive navigation for mobile devices

### Favorites System
- **Local Storage**: Browser-based favorites persistence
- **Database Integration**: Server-side favorites storage with quote data caching
- **Real-time Updates**: Optimistic updates with TanStack Query mutations

## Data Flow

1. **Quote Loading**: Application loads quotes from database on page initialization
2. **Category Filtering**: Client-side filtering with server-side category queries
3. **Daily Quote**: Server generates deterministic daily quote based on current date
4. **Random Quote**: Attempts external API fetch, falls back to local random selection
5. **Favorites Management**: Client optimistically updates UI, syncs with server
6. **Share Actions**: Native Web Share API with social media fallbacks

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router

### External Services
- **Quotable API**: External quote source for content expansion
- **Neon Database**: Serverless PostgreSQL hosting
- **Social Share APIs**: Native Web Share with platform-specific fallbacks

### Development Tools
- **Vite**: Build tool with HMR and TypeScript support
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Production build compilation
- **TypeScript**: Static type checking across full stack

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React application to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Database**: Drizzle Kit manages schema migrations

### Environment Configuration
- **Development**: Uses Vite dev server with Express middleware
- **Production**: Serves static files from Express with built React app
- **Database**: PostgreSQL connection via `DATABASE_URL` environment variable

### File Structure
- **`client/`**: React frontend application
- **`server/`**: Express backend API
- **`shared/`**: Common TypeScript types and schemas
- **`migrations/`**: Database migration files

The application uses a monorepo structure with shared TypeScript configuration and path aliases for clean imports across frontend and backend code.