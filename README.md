# 🛡️ SupportSphere — Modern Support Management System

SupportSphere is a full-stack, enterprise-grade Support Desk & Ticket Management Application engineered with a **React + TypeScript + Vite + Tailwind CSS** frontend and a high-performance **Go (Golang) + Fiber v2 + GORM + Supabase PostgreSQL** REST API backend.

![License](https://img.shields.io/badge/license-MIT-teal.svg)
![Frontend](https://img.shields.io/badge/Frontend-React_18_%7C_TypeScript_%7C_Vite_%7C_Tailwind-teal)
![Backend](https://img.shields.io/badge/Backend-Go_1.22_%7C_Fiber_v2_%7C_GORM-00ADD8)
![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E)

---

## 🌐 Live Production Deployments

- **Frontend App (Vercel)**: [https://support-sphere-eight.vercel.app/](https://support-sphere-eight.vercel.app/)
- **Backend REST API (Vercel)**: [https://support-sphere-bj6c.vercel.app/](https://support-sphere-bj6c.vercel.app/)
- **API Swagger Documentation**: [https://support-sphere-bj6c.vercel.app/swagger/index.html](https://support-sphere-bj6c.vercel.app/swagger/index.html)

---

## ✨ Features & Functionalities Breakdown

### 🔐 1. Authentication & Security System
- **2-Role Access Control (RBAC)**:
  - **CUSTOMER**: Can create, view, comment on, and track their own support tickets.
  - **ADMIN**: Has full access to view, assign, update, resolve, and delete all tickets, plus manage system users.
- **Dual-Token JWT Security**:
  - **Access Token**: Short-lived (15 minutes) for authenticating API requests.
  - **Refresh Token**: Long-lived (7 days) with token rotation for seamless session persistence.
- **Brute-Force & Rate Limiting Protection**:
  - Automatically locks out account for **15 minutes** after 5 consecutive failed login attempts.
  - Strict IP rate limiting middleware to prevent API abuse.
- **Password Strength Meter**: Real-time visual strength indicator (Weak, Fair, Good, Strong) during registration.
- **Logout Confirmation Dialog**: Popup modal requiring user confirmation before logging out from Sidebar, Navbar, or Landing page.

---

### 🎫 2. Ticket Management Engine
- **Ticket Creation**:
  - Rich form validation powered by **React Hook Form + Zod**.
  - Fields: `Title`, `Description`, `Category` (`Technical Support`, `Billing & Invoicing`, `Account Management`, `Feature Request`, `Bug Report`, `General Inquiry`), and `Priority` (`Low`, `Medium`, `High`, `Urgent`).
  - Pre-selected sensible defaults to eliminate validation errors.
- **Ticket Lifecycle Management**:
  - Status progression: `Open` $\rightarrow$ `In Progress` $\rightarrow$ `Closed / Finished`.
  - Detailed **Status Timeline audit log** tracking every state transition with timestamp and actor.
- **Real-Time Filtering & Search**:
  - Instant text search across ticket IDs and titles.
  - Filter by `Status`, `Priority`, or `Category`.
  - Sort by `Newest First`, `Oldest First`, or `Highest Priority`.
- **Dual Display Modes**:
  - **Table View**: 100% clickable rows with hover highlighting.
  - **Grid Card View**: Responsive card layout with badge indicators.

---

### 👑 3. Admin Powers & Controls
- **Global Ticket Control**: Admin can view and manage all tickets across the entire organization.
- **Quick Row Actions**:
  - 🟢 **Finish Button**: One-click action to mark any ticket as `Closed / Finished` directly from table rows or detail pages.
  - 🔴 **Delete Ticket Button**: Permanent ticket removal with confirmation modal.
- **Agent Ticket Assignment**: Assign unassigned tickets to specific team members.
- **User Management Portal (`/admin/users`)**: Search registered users, view roles, and manage system access.

---

### 📊 4. Real-Time Analytics & Operations Dashboard
- **Live System Metric Cards**:
  - `Total Users` (Clickable $\rightarrow$ `/admin/users`)
  - `Total Tickets` (Clickable $\rightarrow$ `/tickets`)
  - `Open Tickets` (Clickable $\rightarrow$ `/tickets`)
  - `In Progress Tickets` (Clickable $\rightarrow$ `/tickets`)
  - `Closed Tickets` (Clickable $\rightarrow$ `/tickets`)
- **Interactive Recharts Visualizations**:
  - **Tickets by Priority Bar Chart**: Visual breakdown of Low, Medium, High, and Urgent tickets.
  - **Tickets by Category Bar Chart**: Distribution across technical, billing, account, feature, bug, and general categories.
  - **Status Breakdown Pie Chart**: Proportional donut breakdown of Open, In Progress, and Closed tickets.
- **Live System Tickets Table**: Real-time listing of recent tickets with 100% clickable rows.

---

### 🎨 5. User Interface & Aesthetics
- **Helpdesk Brand Design**: Sleek modern teal design system (`#0d9488`).
- **Default Light Theme**: Forces clean Light Mode on initial landing while supporting toggleable Dark Mode.
- **Framer Motion Animations**: Micro-animations for card entry, state changes, and page transitions.
- **Single-Page Application (SPA) Rewrites**: Configured `vercel.json` rewrite rules to ensure refreshing direct URLs (`/tickets/:id`, `/dashboard`) never yields 404 errors.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 (TypeScript) + Vite
- **Styling**: Vanilla CSS + Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms & Validation**: React Hook Form + Zod
- **State Management**: Zustand (Auth, Theme, UI)
- **Data Fetching**: React Query (TanStack Query)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Backend
- **Language**: Go 1.22+
- **Web Framework**: Fiber v2 (Express-inspired fast HTTP router)
- **ORM**: GORM (Go Object Relational Mapping)
- **Database**: PostgreSQL (Hosted on Supabase)
- **Authentication**: JWT (`golang-jwt/jwt/v5`) + Bcrypt
- **API Specs**: Swagger OpenAPI 2.0 (`swaggo/fiber-swagger`)

---

## 📁 Repository Directory Structure

```
support-management-system/
├── GO_Backend/                    # Go Fiber REST API Backend
│   ├── cmd/
│   │   └── api/
│   │       └── main.go            # API Server Entrypoint & CORS
│   ├── docs/                      # Swagger OpenAPI documentation
│   ├── internal/
│   │   ├── config/                # Environment & Config loader
│   │   ├── database/              # PostgreSQL GORM connection & Auto-migrations
│   │   ├── dto/                   # Request/Response Data Transfer Objects
│   │   ├── handlers/              # Auth, Ticket, User & Dashboard handlers
│   │   ├── middleware/            # JWT Auth, Rate Limiter, Error Handler, Logger
│   │   ├── models/                # GORM Data Models (User, Ticket, RefreshToken, AuditLog)
│   │   ├── repository/            # DB Queries & Repositories
│   │   ├── routes/                # Endpoint router registration
│   │   └── services/              # Business logic layer
│   └── Go.mod
│
└── support-system/                # React Vite Frontend App
    ├── public/
    ├── src/
    │   ├── components/            # Reusable UI components (Buttons, Cards, Modals, Tables)
    │   │   ├── layout/            # Navbar, Sidebar, Page Layout
    │   │   └── ui/                # Status Badges, Inputs, ConfirmDialog
    │   ├── features/
    │   │   ├── admin/             # Admin User Management & Controls
    │   │   ├── auth/              # Login, Register pages
    │   │   ├── dashboard/         # Admin & Customer Dashboards with Recharts
    │   │   ├── landing/           # Helpdesk Landing Page
    │   │   └── tickets/           # Create Ticket, List Tickets, Ticket Details
    │   ├── hooks/                 # Custom React Query hooks (useTickets, useUsers)
    │   ├── lib/                   # Axios interceptor, Utils, Formatter helpers
    │   ├── store/                 # Zustand stores (authStore, themeStore, uiStore)
    │   └── types/                 # TypeScript interfaces
    ├── vercel.json                # SPA rewrite routing configuration
    └── package.json
```

---

## 🔌 API Endpoints Summary

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new Customer/Admin user | ❌ |
| `POST` | `/api/v1/auth/login` | Authenticate user & receive JWT tokens | ❌ |
| `POST` | `/api/v1/auth/refresh` | Refresh Access Token using Refresh Token | ❌ |
| `POST` | `/api/v1/auth/logout` | Revoke session & refresh token | 🔒 |

### Tickets (`/api/v1/tickets`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/tickets` | Fetch tickets list (filtered by user role) | 🔒 |
| `GET` | `/api/v1/tickets/:id` | Get ticket details with timeline & comments | 🔒 |
| `POST` | `/api/v1/tickets` | Create new support ticket | 🔒 |
| `PUT` | `/api/v1/tickets/:id` | Update ticket status/priority | 🔒 |
| `DELETE` | `/api/v1/tickets/:id` | Delete ticket permanently (Admin only) | 🔒 Admin |

### Users & Dashboard (`/api/v1`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/dashboard/stats` | Fetch real-time system stats & chart data | 🔒 Admin |
| `GET` | `/api/v1/users` | List all system users | 🔒 Admin |
| `PUT` | `/api/v1/users/:id/role` | Change user role (Customer $\leftrightarrow$ Admin) | 🔒 Admin |

---

## 🚀 Local Development Setup Guide

### 1. Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [Go 1.22+](https://go.dev/)
- [PostgreSQL Database](https://supabase.com/)

### 2. Backend Setup
```bash
# Navigate to Go Backend directory
cd GO_Backend

# Create .env file with your database URL
echo "DATABASE_URL=postgresql://user:password@host:5432/postgres" > .env
echo "JWT_SECRET=super-secret-jwt-key" >> .env
echo "APP_PORT=8080" >> .env
echo "APP_ENV=development" >> .env

# Run Go server
go run cmd/api/main.go
```
*Backend will start on `http://localhost:8080` with Swagger docs at `http://localhost:8080/swagger/index.html`.*

### 3. Frontend Setup
```bash
# Navigate to React Frontend directory
cd support-system

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8080" > .env

# Run development server
npm run dev
```
*Frontend will start on `http://localhost:5173`.*

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@helpdesk.com` | `AdminPassword123!` |
| **Customer** | `demo@user.com` | `CustomerPassword123!` |

*(You can also use the 1-Click Quick Demo Login buttons on the Sign In page).*

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
