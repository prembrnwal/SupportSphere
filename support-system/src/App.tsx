import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

import { LandingPage } from '@/features/landing/LandingPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { CustomerDashboard } from '@/features/dashboard/CustomerDashboard';
import { AdminDashboard } from '@/features/dashboard/AdminDashboard';
import { CreateTicketPage } from '@/features/tickets/CreateTicketPage';
import { MyTicketsPage } from '@/features/tickets/MyTicketsPage';
import { TicketDetailsPage } from '@/features/tickets/TicketDetailsPage';
import { ManageUsersPage } from '@/features/admin/ManageUsersPage';
import { AssignTicketsPage } from '@/features/admin/AssignTicketsPage';
import { ProfilePage } from '@/features/profile/ProfilePage';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0b0d12] px-4 text-center">
      <p className="text-6xl font-extrabold text-brand-600 mb-2">404</p>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Page not found</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <a href="/" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
        Return home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer + Agent area */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/tickets/create" element={<CreateTicketPage />} />
        <Route path="/tickets" element={<MyTicketsPage />} />
        <Route path="/tickets/:id" element={<TicketDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <ManageUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assign"
          element={
            <ProtectedRoute roles={['admin']}>
              <AssignTicketsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
