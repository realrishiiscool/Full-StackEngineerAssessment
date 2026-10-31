import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Users,
  ClipboardList,
  Wrench,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/assets', label: 'Assets', icon: Box },
  { to: '/technicians', label: 'Technicians', icon: Users },
  { to: '/work-orders', label: 'Work Orders', icon: ClipboardList },
];

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-900 text-white flex flex-col">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700/50">
          <div className="p-2 rounded-lg bg-indigo-600">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">MaintainPro</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-700/50">
          <p className="text-xs text-gray-500 text-center">
            © 2024 MaintainPro
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center px-8 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-800">
            Maintenance Work Order Manager
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
