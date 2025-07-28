# LoveSync - Couple's Relationship Management App

## Overview

LoveSync is a romantic web application designed for couples to manage their relationship activities, share memories, and stay connected. The application provides a dashboard where partners can track moods, plan dates, share photos, and send love notes to each other. Built with a modern full-stack architecture, it features Google OAuth authentication restricted to authorized email addresses and a PostgreSQL database for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with a clear separation between client (React frontend) and server (Express backend) code, sharing common schemas and types through a shared directory.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with a romantic color palette theme
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Management**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with Google OAuth 2.0 strategy
- **Session Management**: Express sessions with cookie-based storage
- **Database**: PostgreSQL via Neon serverless with Drizzle ORM
- **API**: RESTful endpoints with JSON responses
- **File Structure**: Modular routing with centralized storage layer

## Key Components

### Authentication System
- Google OAuth 2.0 integration with authorized email restriction
- Session-based authentication with persistent login state
- Protected routes requiring authentication
- Automatic redirect handling for unauthorized access

### Database Schema
The application uses a well-structured relational database with the following main entities:
- **Users**: Profile information linked to Google accounts
- **Couples**: Relationship pairing between two users
- **Calendar Events**: Date planning, memories, and anniversaries
- **Photos**: Shared photo gallery with captions
- **Moods**: Daily mood tracking for each partner
- **Work Status**: Current availability status sharing
- **Love Notes**: Messages between partners

### UI Components
- Responsive design with mobile-first approach
- Romantic color scheme with pink, rose, and warm tones
- Comprehensive component library including forms, modals, and interactive elements
- Toast notifications for user feedback
- Loading states and error handling

### Core Features
1. **Dashboard**: Central hub displaying all relationship activities
2. **Calendar Management**: Event creation and viewing with different event types
3. **Photo Gallery**: Image sharing with upload capabilities
4. **Mood Tracking**: Daily emotional state sharing
5. **Work Status**: Real-time availability updates
6. **Love Notes**: Private messaging system
7. **Timeline**: Historical view of shared memories
8. **Statistics**: Relationship metrics and milestones

## Data Flow

1. **Authentication Flow**: Users authenticate via Google OAuth, session is established, and user data is stored/retrieved
2. **Data Operations**: Client makes API requests through React Query, server validates sessions and processes requests via Drizzle ORM
3. **Real-time Updates**: Optimistic updates with automatic cache invalidation for immediate UI feedback
4. **File Handling**: Photo uploads processed through dedicated upload endpoints (placeholder implementation)

## External Dependencies

### Core Technologies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle with PostgreSQL dialect
- **Authentication**: Google OAuth 2.0 APIs
- **File Storage**: Placeholder implementation for photo uploads (designed for future Supabase integration)

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **ESLint & Prettier**: Code quality and formatting
- **Vite**: Development server with hot module replacement
- **TSX**: TypeScript execution for development server

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library
- **Date-fns**: Date manipulation utilities

## Deployment Strategy

### Development Environment
- Vite development server for frontend with proxy to Express backend
- Single command development startup with `npm run dev`
- Hot module replacement for rapid development cycles
- TypeScript compilation checking with `npm run check`

### Production Deployment (Vercel)
**Status: Production-ready for GitHub to Vercel deployment**

#### Build Configuration
1. Frontend builds to `dist/public` directory via Vite
2. Backend compiled for Vercel serverless functions via esbuild
3. Vercel-specific API endpoint in `/api/index.ts` for serverless deployment
4. Static file serving optimized for Vercel CDN

#### Deployment Files
- `vercel.json`: Vercel deployment configuration with routing rules
- `api/index.ts`: Serverless function entry point for Vercel
- `DEPLOYMENT.md`: Complete production deployment guide
- `.env.example`: Template for required environment variables
- `README.md`: Comprehensive project documentation

#### Database Management
- Drizzle Kit for schema migrations stored in `./migrations`
- Database push command for schema synchronization
- Supabase PostgreSQL database integration for production
- Environment-based configuration for development and production databases

#### Environment Configuration
Production environment variables required:
- `DATABASE_URL`: Supabase PostgreSQL connection string
- `GOOGLE_CLIENT_ID`: OAuth client identifier from Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: OAuth client secret from Google Cloud Console
- `SESSION_SECRET`: Random string for session encryption (min 32 characters)
- `PARTNER1_EMAIL` & `PARTNER2_EMAIL`: Authorized Gmail addresses only
- `NODE_ENV`: Production environment flag

#### Security Features
- OAuth restricted to exactly 2 predefined Gmail addresses
- Session-based authentication with encrypted cookies
- HTTPS enforcement in production
- Health check endpoint at `/api/health`
- Request size limits (10MB) for photo uploads

The application is designed as a private couple's app with restricted access, emphasizing security, romantic user experience, and seamless data synchronization between partners.