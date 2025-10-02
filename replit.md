# Overview

This is a smart parcel delivery system that manages package deliveries through automated lockboxes. The application enables residents to receive packages in secure boxes, couriers to manage deliveries, and administrators to oversee the entire system. The platform provides real-time tracking, secure box access through OTP/QR codes, and comprehensive delivery management capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Technology Stack

**Frontend:**
- React with TypeScript for the UI framework
- Vite as the build tool and development server
- Wouter for client-side routing
- TanStack Query (React Query) for server state management
- Shadcn UI components built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens

**Backend:**
- Express.js server with TypeScript
- Node.js runtime (ESNext module format)
- RESTful API architecture

**Database:**
- PostgreSQL via Neon serverless
- Drizzle ORM for type-safe database queries
- WebSocket connection for serverless compatibility

## Authentication & Authorization

**Security Implementation:**
- JWT (JSON Web Tokens) for stateless authentication
- Bcrypt for password hashing with 10 salt rounds
- Bearer token authentication via Authorization headers
- Role-based access control (RBAC) with three roles:
  - `resident` - package recipients
  - `courier` - delivery personnel  
  - `admin` - system administrators
- Middleware-based route protection with `requireAuth` and `requireRole`
- 24-hour token expiration

## Database Schema

**Core Tables:**
- `users` - User accounts with role-based permissions
- `boxes` - Smart lockboxes with status, location, and battery monitoring
- `deliveries` - Package tracking with status workflow
- `unlock_codes` - Temporary OTP/QR codes for box access
- `notifications` - User notification system

**Key Relationships:**
- Boxes have optional owners (users)
- Deliveries link boxes, couriers, and recipients
- Unlock codes are associated with specific boxes
- Notifications are user-specific

**Status Enums:**
- User roles: resident, courier, admin
- Box status: operational, maintenance, offline
- Delivery status: pending, assigned, in_transit, delivered, failed

## Service Layer Architecture

**OTPService:**
- Generates random 6-digit OTP codes
- Manages expiration times (default 5 minutes)
- Validates OTP freshness

**QRService:**
- Generates unique QR codes using SHA-256 hashing
- Combines box ID, user ID, and timestamp for uniqueness
- Verifies QR codes against box IDs
- Implements time-based expiration

**NotificationService:**
- Creates in-app notifications for delivery events
- Console logging for development (placeholder for SMS/USSD)
- Event types: delivery_assigned, delivery_delivered, box_unlocked, low_battery
- Automated notifications for key workflow stages

## API Design Patterns

**RESTful Endpoints:**
- `/api/auth/*` - Authentication and registration
- `/api/boxes/*` - Box management and status
- `/api/deliveries/*` - Delivery tracking and assignment
- `/api/notifications/*` - User notifications
- `/api/unlock/*` - Box unlock via OTP/QR

**Request Processing:**
- JSON request/response format
- Request body validation using Zod schemas
- Error handling with appropriate HTTP status codes
- Response logging middleware for API routes

## Frontend Architecture

**Component Structure:**
- Page-based routing (login, register, dashboard, not-found)
- Layout component with role-based dashboard switching
- Separate dashboard views for resident, courier, and admin roles
- Reusable UI components from Shadcn library
- Modal system for unlock operations

**State Management:**
- AuthContext for global authentication state
- React Query for server state caching and synchronization
- Local state for form handling and UI interactions
- Token storage in memory (can be enhanced with localStorage)

**Routing Strategy:**
- Protected routes with authentication checks
- Loading states during authentication verification
- Automatic redirects for unauthenticated users
- Role-specific view switching within authenticated area

## Build & Deployment

**Development:**
- TSX for running TypeScript server in development
- Vite HMR for instant frontend updates
- Replit-specific plugins for development environment

**Production:**
- Vite builds optimized client bundle to `dist/public`
- esbuild bundles server to `dist/index.js`
- ESM format throughout for modern JavaScript
- Static file serving in production mode

# External Dependencies

## Database Services
- **Neon Database** - Serverless PostgreSQL hosting
  - Connection via `@neondatabase/serverless` package
  - WebSocket-based connections for serverless compatibility
  - Environment variable: `DATABASE_URL`

## UI Component Libraries
- **Radix UI** - Headless accessible component primitives
  - Full suite of components (dialog, dropdown, select, etc.)
  - Foundation for custom Shadcn components
- **Shadcn UI** - Pre-styled component system
  - Built on Radix primitives
  - Tailwind CSS integration
  - Customizable design tokens

## Development Tools
- **Replit Integrations**
  - `@replit/vite-plugin-runtime-error-modal` - Error overlay
  - `@replit/vite-plugin-cartographer` - Development tooling
  - `@replit/vite-plugin-dev-banner` - Development banner
- **Drizzle Kit** - Database migration tool
  - Schema-driven migrations
  - Push command for development

## Utility Libraries
- **date-fns** - Date manipulation and formatting
- **class-variance-authority** - Component variant management
- **clsx** & **tailwind-merge** - Conditional class handling
- **zod** - Runtime type validation and schema parsing
- **nanoid** - Unique ID generation

## Future Integration Points
- SMS/USSD gateway for notifications (currently console logging)
- Real-time WebSocket for live delivery updates
- Payment processing for delivery fees
- External courier API integrations