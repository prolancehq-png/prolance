# Prolance - Freelance Marketplace

## Overview

Prolance is a full-stack freelance marketplace application similar to Fiverr. It enables freelancers to create and sell gigs (services), while buyers can browse, purchase, and communicate with sellers through an order-based messaging system. The platform handles user authentication via Replit Auth, manages orders with status tracking, and provides a dashboard for both buyers and sellers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion for page transitions and animations
- **Build Tool**: Vite with HMR support

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect) with Passport.js
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage
- **API Design**: REST API with shared route definitions and Zod schemas between client/server

### Data Storage
- **Database**: PostgreSQL (required - DATABASE_URL environment variable)
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` and `shared/models/auth.ts`
- **Key Tables**:
  - `users` - User profiles (managed by Replit Auth)
  - `sessions` - Session storage for authentication
  - `categories` - Service categories
  - `gigs` - Freelancer service listings
  - `orders` - Purchase transactions between buyers and sellers
  - `messages` - Order-related communication
  - `reviews` - Gig reviews

### Authentication & Authorization
- **Provider**: Replit Auth via OpenID Connect
- **Implementation**: Located in `server/replit_integrations/auth/`
- **Session Storage**: PostgreSQL-backed sessions
- **Protected Routes**: Client-side route protection with redirect to `/api/login`
- **User Data**: Automatically synced from Replit Auth on login

### Project Structure
```
client/           # React frontend
  src/
    components/   # Reusable UI components
    pages/        # Route pages
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
server/           # Express backend
  replit_integrations/auth/  # Replit Auth implementation
shared/           # Shared types, schemas, and route definitions
  schema.ts       # Drizzle database schema
  routes.ts       # API route definitions with Zod schemas
  models/         # Data models
```

### Build System
- **Development**: Vite dev server with Express middleware
- **Production**: esbuild bundles server, Vite builds client to `dist/`
- **Database Migrations**: `npm run db:push` uses Drizzle Kit

## External Dependencies

### Database
- **PostgreSQL**: Required for all data storage. Connection via `DATABASE_URL` environment variable.

### Authentication
- **Replit Auth**: OpenID Connect provider at `https://replit.com/oidc`
- **Required Environment Variables**:
  - `DATABASE_URL` - PostgreSQL connection string
  - `SESSION_SECRET` - Secret for session encryption
  - `REPL_ID` - Automatically set by Replit

### Key NPM Packages
- **ORM**: drizzle-orm, drizzle-zod, drizzle-kit
- **Database**: pg (node-postgres)
- **Auth**: passport, openid-client, express-session, connect-pg-simple
- **UI**: Full Radix UI component suite, Tailwind CSS, class-variance-authority
- **Data Fetching**: @tanstack/react-query
- **Validation**: zod, @hookform/resolvers
- **Date Handling**: date-fns