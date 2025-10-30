# Overview

The **Last Smart Mile** is a smart parcel delivery system designed to automate and manage package deliveries using secure, automated lockboxes. It serves residents, couriers, and administrators, offering real-time tracking, secure box access via OTP/QR codes, comprehensive delivery management, and integrated payment processing for subscriptions. The project aims to revolutionize last-mile delivery by enhancing security, efficiency, and user experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# UI/UX Design

## Color Scheme
- **Primary Theme:** Teal Blue - Modern, professional color palette with excellent accessibility
- **Primary Color:** hsl(190, 85%, 36%) - Vibrant teal for primary actions and branding
- **Secondary Color:** hsl(184, 60%, 48%) - Lighter teal for secondary elements
- **Accent Color:** hsl(176, 75%, 45%) - Bright teal for highlights and interactive elements
- **Charts:** Coordinated teal palette (5 shades) for data visualization
- **Dark Mode:** Deep teal backgrounds (hsl(192, 50%, 8%)) with light teal accents

## Layout & Navigation
- **Sidebar:** Dark teal sidebar (72px width) with solid teal branding, active state indicators with solid teal backgrounds
- **TopBar:** Clean header with solid teal accents, prominent Quick Unlock CTA button with solid teal background
- **Main Content:** Max-width container (1800px) with solid background, smooth fade-in animations
- **Responsive Design:** Mobile-friendly with proper spacing and touch targets
- **Auth Pages (Login/Register):** Horizontal layout with three sections:
  - Top: Centered teal blue header with logo, "Revolutionizing Last-Mile Delivery" heading, and decorative blur patterns
  - Middle: Clean white form section with step indicators (register) or login fields
  - Bottom: Teal features section displaying 4 key benefits (Secure Smart Lockboxes, Real-Time Tracking, Instant Notifications, 24/7 Monitoring)

## Visual Enhancements
- **Solid Colors:** Consistent solid teal colors used for buttons, badges, and active states for a clean, modern look
- **Shadows:** Strategic use of shadows (xl shadows on buttons and cards) for visual hierarchy
- **Animations:** Smooth transitions and hover effects for polished interactions
- **Border Radius:** Rounded corners (xl radius) for modern, friendly appearance
- **Typography:** Bold headings with tight tracking, clear visual hierarchy

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
- **Core Tables:** `users` (enhanced profile, supports multiple accounts per email), `boxes` (with `isActive` status), `deliveries` (with `serviceType`), `payments` (Paystack integration), `unlock_codes`, `notifications`, `installation_requests`, `service_pricing`.
- **Relationships:** Boxes link to users, deliveries link boxes/couriers/recipients; payments link to users; unlock codes to boxes; notifications to users; installation requests track hardware deployment.
- **Status Enums:** User roles, box status (operational, maintenance, offline), delivery status (pending, assigned, in_transit, delivered, failed), payment status (pending, completed, failed), installation request status (pending, contacted, scheduled, completed, cancelled), service types (standard, express, premium), establishment status (new, existing), establishment type (standalone, apartments, common_area, business_establishment).
- **User Registration:** Includes `county`, `estateName`, `apartmentName`, `latitude`, `longitude` for residents. Location is selected via interactive map with ~1-10 meter accuracy. Email field is non-unique to support multiple accounts per email.
- **Box Active Status:** `isActive` boolean field prevents allocation of deactivated/inactive boxes. Only active boxes can be assigned to deliveries.

## Service Layer Architecture
- **OTPService:** Generates and validates 6-digit OTPs with expiration.
- **QRService:** Generates unique QR codes (SHA-256) with expiration.
- **NotificationService:** Creates in-app notifications for delivery events, low battery, etc., with placeholder for SMS/USSD.

## API Design Patterns
- **RESTful Endpoints:** Standardized endpoints for authentication, box management, deliveries, notifications, unlock operations, installation requests, and service pricing.
- **Request Processing:** JSON format, Zod schema validation, HTTP status code-based error handling.
- **Admin Box Registration:** POST /api/boxes/register - Admins can register new smart boxes with boxId, location, coordinates, and battery level.
- **Admin Delivery Assignment:** POST /api/deliveries/assign - Admins create deliveries with service type selection and assign to couriers or leave as pending (admin-only endpoint). Validates box is active before assignment.
- **Courier Self-Assignment:** PATCH /api/deliveries/:id/assign-to-me - Couriers self-assign pending deliveries (courier-only endpoint, prevents privilege escalation).
- **Subscription Management:** GET /api/subscriptions - Admins view all resident subscriptions with box counts, plans, amounts paid, and expiry dates (optimized JOIN queries).
- **Installation Requests:** POST /api/installation-requests - Public endpoint for hardware installation requests; GET /api/installation-requests - Admin endpoint to view all requests; PATCH /api/installation-requests/:id - Admin endpoint to update request status.
- **Service Pricing:** GET /api/service-pricing - Public endpoint for active pricing tiers; GET /api/service-pricing/all - Admin endpoint for all pricing; POST/PATCH /api/service-pricing - Admin endpoints to manage pricing.
- **Active Boxes:** GET /api/boxes/active - Fetch only active boxes for allocation/assignment.
- **Security:** Login uses username only (email no longer unique); delivery endpoints enforce role-based access control; box allocation validates isActive status.

## Frontend Architecture
- **Component Structure:** Page-based routing, role-based layouts, reusable Shadcn UI components, modal system, interactive map picker.
- **State Management:** AuthContext for global auth, React Query for server state, local state for UI.
- **Routing:** Protected routes, loading states, redirects, role-specific views.
- **Location Selection:** Interactive map-based location picker using Leaflet with OpenStreetMap tiles. Users can click or drag markers to pin their exact location with 7 decimal place precision (~1-10 meter accuracy). Includes "Use My Location" button for GPS positioning.
- **Multi-Step Registration:** Registration form with dynamic steps based on user role for better UX:
  - **Residents (4 Steps):**
    - Step 1 (Basic Info): Name, username, email, phone number
    - Step 2 (Account Details): Role selection, box code, county, estate name, apartment name
    - Step 3 (Location): Interactive map picker for exact location selection
    - Step 4 (Password): Password and confirmation
  - **Non-Residents (3 Steps - Couriers/Admins):**
    - Step 1 (Basic Info): Name, username, email, phone number
    - Step 2 (Account Type): Role selection only
    - Step 3 (Password): Password and confirmation (location step automatically skipped)
  - **Features:** Dynamic step indicators that adjust to role (3 or 4 steps), Next/Back navigation with smart skip logic, form data persistence across steps, field validation at each step, role-based step labels

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

# New Features (Latest Updates)

## Multiple Accounts Per Email
- **Change:** Removed unique constraint on email field in users table.
- **Benefit:** Allows users to create multiple accounts (e.g., different roles) using the same email address.
- **Implementation:** Database migration preserves existing data while removing unique constraint.

## Estate Name Field
- **Change:** Replaced `constituency` field with `estateName` in user registration.
- **Benefit:** More accurate location specification for estate/neighborhood-based delivery.
- **UI Update:** Registration form now includes Estate Name input instead of Constituency.

## Smart Box Active Status
- **Feature:** Added `isActive` boolean field to boxes table (default: true).
- **Security:** Delivery assignment validates box is active before allocation.
- **Admin Control:** Admins can deactivate boxes to prevent new deliveries (maintenance, replacement, etc.).
- **Error Handling:** Returns clear error message if attempting to assign delivery to inactive box.

## Installation Request System
- **Public Form:** `/installation-request` route for customers to request smart box installation.
- **Form Fields:** Customer info, installation location (with GPS coordinates via interactive map), establishment categorization, preferred installation date, special notes.
- **Establishment Categorization:**
  - **Status:** New Establishment or Existing Establishment (default: new)
  - **Type:** Stand Alone/Gated Community, Apartments, Common Area, or Business Establishment (default: standalone)
  - Helps admins categorize and filter installation requests by property type
- **Admin Management:** Installation requests displayed in admin dashboard with status tracking and filtering.
- **Status Workflow:** pending → contacted → scheduled → completed/cancelled.
- **Filtering:** Admins can filter requests by status and establishment type for better organization.
- **UI Component:** `InstallationRequestsManager` component in admin dashboard shows all requests with filtering, establishment badges, and status update capabilities.

## Tiered Service Pricing
- **Service Types:** Standard (48h), Express (24h), Premium (6h same-day).
- **Pricing Model:** Base price + per-kg weight charge for each tier.
- **Default Pricing:**
  - Standard: KES 200 base + KES 50/kg (48h delivery)
  - Express: KES 500 base + KES 100/kg (24h delivery)
  - Premium: KES 1000 base + KES 150/kg (6h delivery)
- **Database:** `service_pricing` table with fields: serviceType, name, description, basePrice, pricePerKg, deliveryTimeHours, isActive.
- **Admin Interface:** Service pricing management in admin dashboard.
- **Delivery UI:** Service type selector in delivery assignment modal with real-time price calculation based on weight.
- **Cost Display:** Shows estimated delivery cost dynamically as admin enters weight and selects service type.

## Payment Structure Update
- **Separation:** Service fees (subscription) separate from hardware fees (one-time installation).
- **Service Fee:** Recurring subscription payment for using the smart box service.
- **Hardware Fee:** One-time payment for smart box installation and setup.
- **Integration:** Both tracked in payments table with appropriate categorization.