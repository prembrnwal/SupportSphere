import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0d12]">
      <Sidebar />
      <div className="lg:pl-64">
        <Navbar />
        <main className="p-4 lg:p-8 max-w-7xl mx-auto animate-fadeUp">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
