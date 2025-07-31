# Boomquotes - Quote Application

## Overview

Boomquotes is a modern full-stack web application for discovering, sharing, and managing inspirational quotes with integrated user authentication and rewards system. The application features a React frontend with Supabase authentication, designed for mobile-first usage and deployment on Vercel. Users can browse quotes by category, complete daily check-ins, earn airtime rewards, and share quotes across social platforms.

## User Preferences

Preferred communication style: Simple, everyday language.
Deployment: Vercel with Supabase backend
Authentication: Supabase Auth with email/password (COMPLETED - working properly)
Target Users: Global users with airtime rewards system (pending business domain for Reloadly API integration)
Profile Features: Comprehensive editing with country auto-detection, phone code auto-fill, age, gender, password change
Rewards System: Separate dedicated rewards page with global airtime distribution
Quote Features: Refreshable daily quotes with download/bookmark functionality, 3 additional categories
Referral System: Functional tracking with invite codes and bonus rewards
Signup Enhancement: All required fields with optional invite code, phone number can only be changed once
Messages Page: Dedicated messages section with 12 categories including good morning, love, good night, romantic, sad, breakup, friendship, birthday, congratulations, encouragement, thank-you, apology (COMPLETED - dropdown category filters implemented)
Quote Preview: Shows generated quotes preview before sharing functionality
Content Population: COMPLETED - Over 100+ quotes and messages per category now implemented with comprehensive content expansion system
Category Filters: COMPLETED - Both Messages and Quotes pages now use dropdown category filters instead of button lists
Animated Transitions: Smooth category transitions with framer-motion animations for enhanced UX
Ad Integration: COMPLETED - Comprehensive Adsterra and Monetag ad system integrated across all pages with mobile/desktop optimization

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
- **Primary Database**: Supabase PostgreSQL with Row Level Security
- **Schema Management**: Direct SQL with functions and triggers
- **Core Tables**:
  - `user_profiles`: User data including Nigerian status for rewards
  - `quotes`: Inspirational quotes with categories and sources
  - `favorites`: User's saved quotes with JSONB data
  - `check_ins`: 10-button daily check-in system with cooldowns and ad tracking
  - `checkin_streaks`: User streak tracking for consecutive days
  - `airtime_rewards`: ₦500 rewards for 30 consecutive check-in days
- **Check-in System**:
  - 10 buttons per day with individual 1-minute cooldowns
  - Each click triggers Adsterra Social Bar ad display
  - Button click tracking with JSONB data for timestamps and cooldowns
  - Automatic streak calculation and reward generation at 30 days

## Key Components

### Quote Management System
- **Quote Sources**: 
  - Built-in seed quotes for initial content across all categories
  - Multiple external API integrations: Quotable.io, ZenQuotes, Quote Garden, GoQuotes, Stoic Quotes
  - Automatic fallback system across multiple APIs for reliability
  - Quote aggregator with source diversification and rate limiting
  - Search functionality across multiple quote databases
  - Real-time quote refresh and source management
- **Categories**: Motivation, Love, Hustle, Wisdom, Life, Romantic, Politics, Social, Funny
- **Random Quote Feature**: Multi-source API integration with intelligent fallback
- **Daily Quote Feature**: Deterministic daily quote selection based on date seed
- **Share Functionality**: WhatsApp, X (Twitter), Facebook, and native share dialog support

### User Interface Components
- **DailyQuoteHero**: Featured daily quote with gradient background
- **CategoryFilters**: Interactive category selection and random quote generation
- **QuotesGrid**: Responsive grid layout for quote browsing
- **QuoteCard**: Individual quote display with favorite/share actions
- **ShareModal**: Social media sharing integration
- **MobileNav**: Responsive navigation for mobile devices

### Favorites System
- **Server Storage**: In-memory favorites storage with full quote data
- **Heart Toggle**: One-click favorite/unfavorite functionality
- **Real-time Updates**: Optimistic updates with TanStack Query mutations
- **Persistent Storage**: Favorites maintained across user sessions

## Data Flow

1. **Quote Loading**: Application loads quotes from database on page initialization
2. **Category Filtering**: Client-side filtering with server-side category queries
3. **Daily Quote**: Server generates deterministic daily quote based on current date
4. **Random Quote**: Attempts external API fetch, falls back to local random selection
5. **Favorites Management**: Client optimistically updates UI, syncs with server
6. **Share Actions**: Native Web Share API with social media fallbacks
7. **Push Notifications**: Service worker handles daily quote notifications with browser permission management

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

## Ad Monetization System

### Comprehensive Ad Integration (COMPLETED)
- **Adsterra Social Bar Ads**: Positioned at bottom for check-in functionality with direct navigation to daily check-in page
- **Adsterra Push Ads**: Corner-positioned ads (top-right desktop, bottom-right mobile) with 3-second delay
- **Monetag Banner Ads**: Bottom placement above social bar, minimal height (h-12 mobile, h-16 desktop)
- **Monetag Interstitial Ads**: First daily visit trigger with localStorage tracking, premium upgrade focus
- **Monetag Push Notifications**: Browser notification system with daily quotes and reward alerts

### Ad Layout System
- **AdLayout Component**: Centralized ad management wrapper with mobile/desktop responsive design
- **Non-intrusive Design**: Minimal placeholders during development, proper content spacing (100-120px bottom padding)
- **Smart Positioning**: Z-index management (social bar: 50, banner: 30, push: 40, interstitial: 50)
- **Performance Optimized**: Script loading with fallbacks, localStorage-based frequency capping