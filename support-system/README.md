# SupportHub — Support Management System

A modern, production-ready Support Management System frontend built with React, TypeScript, Vite, and Tailwind CSS. Fully functional against in-memory dummy data — no backend required to explore the UI.

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (dark mode via class strategy)
- React Router v6
- Zustand (auth, theme, UI state — persisted to localStorage)
- TanStack Query (data fetching/mutations against an in-memory mock "API")
- React Hook Form + Zod (validation)
- Axios (pre-wired for real backend integration)
- Framer Motion (page/element transitions)
- Recharts (admin analytics charts)
- Lucide React (icons)
- React Hot Toast (notifications)

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.

### Demo accounts

Login accepts any password. Use these emails to sign in as different roles:

| Role     | Email                  |
|----------|-------------------------|
| Admin    | isha.admin@acme.com     |
| Agent    | priya@acme.com          |
| Customer | aarav@acme.com          |

Or register a brand new customer account from `/register`.

## Project Structure (Feature-Based)

```
src/
  components/
    ui/          # Reusable primitives: Button, Card, Modal, Badge, Table, Input, Select,
                 # Skeleton, Pagination, Loader, ConfirmDialog, EmptyState, ErrorState
    layout/      # Sidebar, Navbar, DashboardLayout, ProtectedRoute
  features/
    landing/     # Marketing landing page
    auth/        # Login, Register
    dashboard/   # Customer + Admin dashboards
    tickets/     # Create Ticket, My Tickets, Ticket Details
    admin/       # Manage Users, Assign Tickets
    profile/     # Profile settings
  hooks/         # useTickets, useUsers (TanStack Query hooks over mock data)
  store/         # Zustand stores: authStore, themeStore, uiStore
  lib/           # dummyData, axios instance, query client, utils
  types/         # Shared TypeScript types
```

## Connecting a Real Backend

All data access goes through `src/hooks/useTickets.ts` and `src/hooks/useUsers.ts`, and through `src/store/authStore.ts` for auth. Replace the in-memory mock functions in these files with real `api.get/post/patch` calls (an Axios instance is already configured in `src/lib/axios.ts` with an auth-token interceptor) — the rest of the app (components, forms, routing) requires no changes since it only depends on the hook/store interfaces.

## Build

```bash
npm run build
npm run preview
```

## Notes

- Every list view includes loading skeletons, empty states, and error states.
- Dark/light theme persists across sessions and respects system preference on first load.
- Role-based routing: `/admin/*` routes are guarded and redirect non-admins to `/dashboard`.
