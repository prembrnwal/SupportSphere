# Support Management System — Go Backend API

A clean, scalable, production-ready REST API backend for a **Support Management System** built with **Go** and **Fiber**, following **Clean Architecture** principles.

---

## 🛠 Tech Stack

- **Language**: Go 1.24+
- **HTTP Framework**: [Fiber v2](https://gofiber.io/)
- **Database**: PostgreSQL 16
- **ORM**: [GORM](https://gorm.io/)
- **Authentication**: JWT & bcrypt password hashing
- **Configuration**: [Viper](https://github.com/spf13/viper)
- **Validation**: `go-playground/validator`
- **Logging**: Uber Zap (`go.uber.org/zap`)
- **Documentation**: Swagger (`gofiber/swagger`)
- **Hot Reloading**: [Air](https://github.com/cosmtrek/air)
- **Containerization**: Docker & Docker Compose

---

## 🏗 Clean Architecture

```
Client / Frontend (React)
         │ (HTTP / JSON)
         ▼
     [ Handler ]        <-- Parses requests, validates DTOs, formats JSON
         │
         ▼
     [ Service ]        <-- Encapsulates core business logic & authorization
         │
         ▼
    [ Repository ]      <-- Performs GORM database queries & preloads
         │
         ▼
    [ Database ]        <-- PostgreSQL
```

---

## 🔐 User Roles & Permissions

1. **ADMIN**
   - Manage all users and update user details / roles.
   - View all tickets in the system.
   - Assign tickets to support agents (`PUT /api/v1/admin/assign-ticket/:id`).
   - Access overall dashboard analytics.

2. **SUPPORT**
   - View assigned tickets (`assigned_to = agent.id`).
   - Update status of assigned tickets (`IN_PROGRESS`, `RESOLVED`, `CLOSED`).

3. **CUSTOMER**
   - Register and login.
   - Create tickets (`OPEN`).
   - View and manage only their own tickets (`created_by = user.id`).

---

## 🔄 Ticket Status Lifecycle Flow

```
Customer creates ticket
   Status: OPEN
       │
       ▼
Admin assigns to Support Agent
   Status: IN_PROGRESS
       │
       ▼
Support Agent resolves ticket
   Status: RESOLVED
       │
       ▼
Ticket is closed
   Status: CLOSED
```

---

## 🚀 API Endpoints Overview

### Authentication
- `POST /api/v1/auth/register` — Register new user
- `POST /api/v1/auth/login` — Login user (returns JWT token)
- `GET /api/v1/me` — Get current logged-in user profile

### User Management
- `GET /api/v1/users` — List all users (ADMIN/SUPPORT only)
- `GET /api/v1/users/:id` — Get user details by ID
- `PUT /api/v1/users/:id` — Update user by ID

### Tickets
- `POST /api/v1/tickets` — Create a new support ticket
- `GET /api/v1/tickets` — List tickets (with pagination, search, status, priority filters, sorting)
- `GET /api/v1/tickets/:id` — Get ticket details
- `PUT /api/v1/tickets/:id` — Update ticket details/status
- `DELETE /api/v1/tickets/:id` — Delete ticket

### Admin Actions
- `PUT /api/v1/admin/assign-ticket/:id` — Assign ticket to support agent

### Dashboard
- `GET /api/v1/dashboard/stats` — Get summary stats (ticket counts by status & priority)

---

## 🔑 Default Seeded Credentials

When starting the application, default demo accounts are automatically seeded into PostgreSQL:

| Role | Email | Default Password |
|---|---|---|
| **ADMIN** | `admin@helpdesk.com` | `AdminPassword123!` |
| **SUPPORT** | `support@helpdesk.com` | `SupportPassword123!` |

---

## 🚦 Getting Started

### Method 1: Using Docker Compose (Recommended)

```bash
# Clone and navigate to backend directory
cd GO_Backend

# Build and start PostgreSQL + Backend containers
docker-compose up --build
```

The API will be live at `http://localhost:8080` and Swagger documentation will be available at `http://localhost:8080/swagger/`.

### Method 2: Running Locally

1. **Start PostgreSQL database** locally or via Docker:
   ```bash
   docker run -d --name postgres_local -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=support_system_db postgres:16-alpine
   ```

2. **Copy `.env.example` to `.env`**:
   ```bash
   cp .env.example .env
   ```

3. **Run the Go application**:
   ```bash
   go run cmd/api/main.go
   ```

4. **Hot Reload with Air (Optional)**:
   ```bash
   air
   ```

---

## 📄 Swagger Documentation

Interactive OpenAPI / Swagger docs are generated automatically and served at:
`http://localhost:8080/swagger/`

To regenerate swagger annotations after modifying handlers:
```bash
go run github.com/swaggo/swag/cmd/swag@latest init -g cmd/api/main.go
```
