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

## SMS Integration (Africa's Talking)

**Implementation:**
- Integrated Africa's Talking API for SMS notifications
- Automatic fallback to console logging if API credentials not configured
- SMS sent for key events: delivery assigned, delivered, unlock codes, low battery alerts

**Configuration (Environment Variables):**
- `AFRICAS_TALKING_API_KEY` - API key from Africa's Talking dashboard
- `AFRICAS_TALKING_USERNAME` - Username (use "sandbox" for testing)
- `AFRICAS_TALKING_FROM` - Sender ID (default: "SMARTPOBOX")

**SMS Notifications:**
- Delivery assigned to box
- Package delivered notification
- OTP unlock codes (6-digit, expires in 5 minutes)
- Low battery alerts (below 20%)
- Tamper detection alerts

## M-Pesa Payment Integration (Safaricom Daraja API)

**Implementation:**
- Integrated M-Pesa STK Push (Lipa Na M-Pesa Online) for subscription payments
- Automatic fallback to mock mode if API credentials not configured
- Payment verification via callback URL and status query endpoints
- Payment history tracking in database with transaction details

**Configuration (Environment Variables):**
- `MPESA_CONSUMER_KEY` - Consumer Key from Daraja API Portal
- `MPESA_CONSUMER_SECRET` - Consumer Secret from Daraja API Portal
- `MPESA_BUSINESS_SHORT_CODE` - Business shortcode (default: "174379" for sandbox)
- `MPESA_PASS_KEY` - Lipa Na M-Pesa Passkey
- `MPESA_CALLBACK_URL` - Public HTTPS URL for payment callbacks (e.g., https://yourdomain.com/api/payments/callback)
- `MPESA_ENVIRONMENT` - "sandbox" or "production" (default: "sandbox")

**Payment Features:**
- STK Push payment initiation (sends prompt to user's phone)
- Real-time payment callback processing
- Payment status tracking and query
- Payment history for each user
- In-app notifications for payment success/failure
- Support for multiple payment types: subscription, delivery fees, top-ups

**API Endpoints:**
- `POST /api/payments/initiate` - Initiate STK Push payment (authenticated)
- `POST /api/payments/callback` - M-Pesa callback handler (public, no auth)
- `GET /api/payments/history` - Get user's payment history (authenticated)
- `GET /api/payments/:id/status` - Check payment status (authenticated)

**Payment Flow:**
1. User initiates payment via API
2. M-Pesa sends STK Push prompt to user's phone
3. User enters M-Pesa PIN to authorize payment
4. M-Pesa sends callback to server with payment result
5. System updates payment status and notifies user
6. Payment history stored in database

## WebSocket Real-Time Notifications

**Implementation:**
- WebSocket server running on `/ws` endpoint
- Token-based authentication for WebSocket connections
- Real-time broadcasts for delivery updates, notifications, and system events
- User-specific and role-based message targeting

**Connection:**
- WebSocket URL: `ws://[host]:[port]/ws?token=[JWT_TOKEN]`
- Authenticated connection using JWT token from login
- Automatic reconnection on disconnect
- Connection confirmation message sent on successful authentication

**Real-Time Events:**
- `notification` - New notification for user
- `delivery_assigned` - Package assigned to user's box
- `delivery_created` - Delivery created (for courier)
- `delivery_status_updated` - Delivery status changed (sent to recipient, courier, and admins)
- `battery_alert` - Low battery detected (sent to box owner and all admins)
- `tamper_alert` - Tamper detection triggered (sent to box owner and all admins)
- `connection` - Initial connection confirmation

**Event Message Format:**
```json
{
  "type": "event_type",
  "data": { /* event-specific data */ }
}
```

**Broadcasting Methods:**
- `sendToUser(userId, message)` - Send to specific user
- `broadcastToRole(role, message)` - Send to all users with specific role (admin, courier, resident)
- `broadcast(message)` - Send to all connected users

**Features:**
- Multiple simultaneous connections per user supported
- Automatic cleanup on disconnect
- Connection tracking by user and role
- Real-time delivery status propagation across dashboards

## Delivery Route Optimization

**Route Optimization Algorithm:**
- Nearest neighbor algorithm (greedy TSP approximation)
- Priority-based routing: Urgent → Express → Normal
- Geographic distance optimization using Haversine formula
- Real-time route calculation based on active deliveries

**API Endpoint:**
- `GET /api/deliveries/route/optimized` (courier only)
- Returns optimized delivery sequence with:
  - Complete route with coordinates and delivery details
  - Total distance in kilometers
  - Estimated delivery time in minutes
  - Total number of stops

**Frontend Features:**
- Visual route display in Courier Dashboard
- Shows optimized delivery sequence (top 5 stops)
- Priority indicators: 🔴 Urgent, 🟡 Express, 🟢 Normal
- Real-time route statistics (distance, time, stops)
- Auto-refresh every 30 seconds

**Box Coordinates:**
- Added latitude/longitude fields to boxes table
- Seed data includes real Nairobi coordinates
- Test locations: Westlands, CBD, Kilimani, Karen, Upper Hill

## Enhanced Box Monitoring

**Battery Monitoring:**
- Real-time battery level tracking for all boxes
- Low battery alerts (< 20%) with SMS and WebSocket notifications
- Critical battery alerts (< 10%) for urgent attention
- Battery analytics dashboard with categorized status (critical/low/medium/good)
- Average battery level across all boxes
- Sorted list of low-battery boxes for maintenance prioritization

**Tamper Detection:**
- Real-time tamper detection alerts from IoT devices
- Instant SMS notifications to box owners
- WebSocket broadcasts to owners and admin dashboards
- Security event logging and tracking
- Immediate response capability

**Analytics Endpoints:**
- `GET /api/analytics/boxes/battery` - Comprehensive battery statistics (admin only)
  - Total boxes count
  - Monitored vs unknown battery status
  - Distribution by battery level (critical/low/medium/good)
  - Average battery level (only from boxes with known levels)
  - Prioritized list of boxes requiring maintenance
  
- `GET /api/analytics/boxes/tamper` - Tamper event analytics (admin only)
  - Total tamper events logged
  - Unresolved vs resolved events count
  - Events in last 24 hours
  - Events in last 7 days
  - List of unresolved tamper events with box details

**Alert Channels:**
- In-app notifications
- SMS alerts (via Africa's Talking)
- Real-time WebSocket broadcasts
- Admin dashboard notifications for all critical events

## Future Integration Points
- USSD gateway for feature phone support
- External courier API integrations
- Delivery route optimization with mapping
- Predictive battery maintenance scheduling
- Advanced tamper event analytics and forensics