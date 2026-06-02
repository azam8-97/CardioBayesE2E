import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BarChart3, Users, Zap, Settings, LogOut, Shield } from 'lucide-react';
import Navbar from './Navbar';
import { useAuthStore } from '../../stores/authStore';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const adminLinks = [
    { label: 'Overview', path: '/admin', icon: BarChart3 },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Inference Jobs', path: '/admin/jobs', icon: Zap },
    { label: 'Model Analytics', path: '/admin/models', icon: Settings },
    { label: 'System Events', path: '/admin/events', icon: Settings },
  ];

  // Add roles link only for superadmin
  if (user?.role === 'superadmin') {
    adminLinks.push({ label: 'Role Management', path: '/admin/roles', icon: Shield });
  }

  return (
    <div className="page-shell flex flex-col h-screen">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed lg:relative left-0 top-16 h-[calc(100vh-64px)] bg-slate-800/50 border-r border-slate-700/50 z-40 transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
          } overflow-hidden`}
        >
          <nav className="h-full flex flex-col p-4 space-y-2">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => {
                    // Close sidebar on mobile after click
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="flex-1" />

            {/* Logout Button */}
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition w-full"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className={`${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                Logout
              </span>
            </button>
          </nav>
        </aside>

        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30 top-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main
          className={`flex-1 overflow-auto transition-all duration-300 ${
            sidebarOpen && window.innerWidth < 1024 ? 'ml-64' : ''
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
