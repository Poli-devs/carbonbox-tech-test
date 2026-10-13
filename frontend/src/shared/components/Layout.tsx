'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  Database,
  Layers,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Panel de Control', icon: LayoutDashboard },
    { href: '/uploads', label: 'Historial de Cargas', icon: FileSpreadsheet },
    { href: '/uploads/new', label: 'Ingesta de CSV', icon: UploadCloud },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          {/* Brand & Nav */}
          <div className="flex items-center gap-8 lg:gap-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/15 group-hover:scale-105 transition-all">
                <Layers className="w-5 h-5 text-slate-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  CarbonBox
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Platform
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Emissions Data Processing Engine
                </span>
              </div>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-slate-900 text-emerald-400 shadow-sm border border-slate-700/80'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* System Status & Primary Action */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-300">Fastify • PostgreSQL 15</span>
            </div>

            <Link
              href="/uploads/new"
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md shadow-emerald-500/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Subir Archivo CSV</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area - Wide Responsive Container */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        {children}
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 text-xs text-slate-500 py-5">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-normal">
            © 2024 <strong className="text-slate-400 font-semibold">CarbonBox Inc.</strong> — Arquitectura DDD • CQRS • Clean Architecture • Next.js 14
          </p>
          <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Backend: Fastify 4.28
            </span>
            <span>•</span>
            <span>Worker: SQS DLQ Resilient</span>
            <span>•</span>
            <span>Frontend: React Query</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

