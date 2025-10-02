# Overview

The **Last Mile Postal System** is a smart parcel delivery system designed to automate and manage package deliveries using secure, automated lockboxes. It serves residents, couriers, and administrators, offering real-time tracking, secure box access via OTP/QR codes, comprehensive delivery management, and integrated payment processing for subscriptions. The project aims to revolutionize last-mile delivery by enhancing security, efficiency, and user experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Technology Stack
- **Frontend:** React with TypeScript, Vite, Wouter for routing, TanStack Query for state management, Shadcn UI (Radix UI, Tailwind CSS).
- **Backend:** Express.js with TypeScript, Node.js, RESTful API.
- **Database:** PostgreSQL (Neon serverless) with Drizzle ORM.

## Authentication & Authorization
- **Security:** JWT for authentication, Bcrypt for password hashing (10 salt rounds), Bearer token.
- **Role-Based Access Control (RBAC):** `resident`, `courier`, `admin` roles with middleware-based protection.
- **Token Expiration:** 24 hours.

## Database Schema
- **Core Tables:** `users` (with enhanced resident profile and payment tracking), `boxes`, `deliveries`, `payments` (Paystack integration), `unlock_codes`, `notifications`.
- **Relationships:** Boxes link to users, deliveries link boxes, couriers, recipients; payments link to users; unlock codes to boxes; notifications to users.
- **Status Enums:** User roles, box status (operational, maintenance, offline), delivery status (pending, assigned, in_transit, delivered, failed), payment status (pending, completed, failed).
- **User Registration:** Includes `county`, `constituency`, `apartmentName`, `latitude`, `longitude` for residents. Location is selected via interactive map with ~1-10 meter accuracy.

## Service Layer Architecture
- **OTPService:** Generates and validates 6-digit OTPs with expiration.
- **QRService:** Generates unique QR codes (SHA-256) with expiration.
- **NotificationService:** Creates in-app notifications for delivery events, low battery, etc., with placeholder for SMS/USSD.

## API Design Patterns
- **RESTful Endpoints:** Standardized endpoints for authentication, box management, deliveries, notifications, and unlock operations.
- **Request Processing:** JSON format, Zod schema validation, HTTP status code-based error handling.

## Frontend Architecture
- **Component Structure:** Page-based routing, role-based layouts, reusable Shadcn UI components, modal system, interactive map picker.
- **State Management:** AuthContext for global auth, React Query for server state, local state for UI.
- **Routing:** Protected routes, loading states, redirects, role-specific views.
- **Location Selection:** Interactive map-based location picker using Leaflet with OpenStreetMap tiles. Users can click or drag markers to pin their exact location with 7 decimal place precision (~1-10 meter accuracy). Includes "Use My Location" button for GPS positioning.

## Build & Deployment
- **Development:** TSX, Vite HMR, Replit plugins.
- **Production:** Vite for client bundle, esbuild for server bundle, ESM format, static file serving.

## Delivery Route Optimization
- **Algorithm:** Nearest neighbor (greedy TSP approximation), priority-based routing (Urgent → Express → Normal), Haversine formula for distance.
- **API Endpoint:** `GET /api/deliveries/route/optimized` for courier-optimized sequences.
- **Frontend:** Visual route display, priority indicators, real-time stats, auto-refresh.

## Enhanced Box Monitoring
- **Battery Monitoring:** Real-time tracking, low/critical battery alerts (SMS, WebSocket), analytics dashboard.
- **Tamper Detection:** Real-time alerts (SMS, WebSocket), security event logging.
- **Analytics Endpoints:** Comprehensive battery and tamper statistics for administrators.
- **Alert Channels:** In-app, SMS, WebSocket, admin dashboard.

# External Dependencies

## Database Services
- **Neon Database:** Serverless PostgreSQL.

## UI Component Libraries
- **Radix UI:** Headless accessible components.
- **Shadcn UI:** Pre-styled components built on Radix UI.
- **Leaflet & React-Leaflet:** Interactive map component for location selection.

## Development Tools
- **Replit Integrations:** Vite plugins for error modals, cartographer, dev banner.
- **Drizzle Kit:** Database migration tool.

## Utility Libraries
- **date-fns:** Date manipulation.
- **class-variance-authority:** Component variant management.
- **clsx & tailwind-merge:** Conditional class handling.
- **zod:** Runtime type validation.
- **nanoid:** Unique ID generation.

## SMS Integration
- **Africa's Talking:** For SMS notifications (delivery, unlock codes, battery/tamper alerts).
- **Configuration:** `AFRICAS_TALKING_API_KEY`, `AFRICAS_TALKING_USERNAME`, `AFRICAS_TALKING_FROM`.

## Payment Integration
- **Paystack:** For subscription payments (M-Pesa, Visa/Mastercard).
- **Configuration:** `PAYSTACK_SECRET_KEY`, `PAYSTACK_CALLBACK_URL`.
- **Features:** Payment initiation, webhook processing, status tracking, payment history.
- **Dashboard Activation:** Restricts resident dashboard access until subscription payment is complete.

## Real-Time Communication
- **WebSocket:** For real-time notifications and updates (delivery status, alerts).
- **Authentication:** Token-based JWT authentication for connections.
- **Events:** `notification`, `delivery_assigned`, `delivery_status_updated`, `battery_alert`, `tamper_alert`.