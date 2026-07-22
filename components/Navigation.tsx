'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  BarChart3, 
  Radio, 
  PlusCircle, 
  Activity, 
  Bell, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { useIncidentStore } from '@/lib/store';
import AlertDispatcherModal from './AlertDispatcherModal';
import TenantSettingsModal from './TenantSettingsModal';
import AuthModal from './AuthModal';
import { Building2, Settings, ShieldCheck } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { incidents, resetToDefault, organizations, activeOrgId, setActiveOrgId, activeOrganization, currentUser } = useIncidentStore();
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [isTenantSettingsOpen, setIsTenantSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const activeP1Count = incidents.filter(i => i.severity === 'P1' && i.status !== 'resolved').length;
  const activeTotalCount = incidents.filter(i => i.status !== 'resolved').length;

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/incidents', label: 'Incidents', icon: AlertTriangle, badge: activeTotalCount },
    { href: '/schedules', label: 'On-Call & Escalation', icon: Calendar },
    { href: '/rca', label: 'RCA & Post-Mortems', icon: FileText },
    { href: '/analytics', label: 'SLA Analytics', icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-red-500/20">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-gray-950">
                  <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse" />
                </div>
              </div>

              {activeOrganization?.logoUrl && (
                <div className="flex h-10 items-center rounded-xl border border-cyan-500/40 bg-slate-900/90 px-3 py-1 shadow-md shadow-cyan-500/10">
                  <img src={activeOrganization.logoUrl} alt={activeOrganization.name} className="h-7 object-contain" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-white text-lg">SENTINEL</span>
                <span className="rounded bg-red-950/80 border border-red-800/60 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                  COMMAND CENTER
                </span>
              </div>
              
              {/* Organization Tenant Branding */}
              <div className="flex items-center space-x-1.5 mt-0.5">
                <Building2 className="h-3 w-3 text-cyan-400" />
                <span className="font-bold text-xs text-cyan-300">
                  Protiviti India Member Private Limited (PRO)
                </span>
                <button
                  onClick={() => setIsTenantSettingsOpen(true)}
                  className="text-gray-400 hover:text-white"
                  title="Organization SLA & Branding Settings"
                >
                  <Settings className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Active System Status Indicator */}
          <div className="hidden md:flex items-center space-x-4">
            {activeP1Count > 0 ? (
              <div className="flex items-center space-x-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <span>SYSTEM CRITICAL: {activeP1Count} ACTIVE P1 INCIDENT{activeP1Count > 1 ? 'S' : ''}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>ALL SYSTEMS OPERATIONAL</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              href="/incidents/create-iof"
              className="flex items-center space-x-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-sm shadow-cyan-500/10"
            >
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>IOF Wizard</span>
            </Link>

            <button
              onClick={() => setIsSimModalOpen(true)}
              className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:from-red-500 hover:to-amber-500 transition-all shadow-md shadow-red-500/10"
            >
              <Radio className="h-4 w-4" />
              <span>+ Dispatch Alert</span>
            </button>

            {/* Authenticated User Profile Badge */}
            {currentUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center space-x-2 rounded-xl border border-gray-800 bg-gray-900/80 p-1 pr-2.5 text-xs text-left hover:border-gray-700 transition-all"
                title="Click to Switch Tenant / Inspect Auth JWT Token"
              >
                <img src={currentUser.avatar} alt={currentUser.name} className="h-7 w-7 rounded-full object-cover border border-cyan-500/50" />
                <div className="hidden sm:block">
                  <div className="font-bold text-white leading-none text-[11px]">{currentUser.name}</div>
                  <div className="text-[9px] font-mono text-cyan-400 mt-0.5">{currentUser.role}</div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-500"
              >
                Login
              </button>
            )}
          </div>

        </div>

        {/* Navigation Bar */}
        <nav className="border-t border-gray-800/80 bg-gray-950/40 px-4 sm:px-6 overflow-x-auto">
          <div className="mx-auto flex max-w-7xl space-x-1 sm:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'border-red-500 text-red-400 bg-red-500/5'
                      : 'border-transparent text-gray-400 hover:border-gray-700 hover:text-gray-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-red-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Dedicated Organization SLA Settings Tab */}
            <button
              onClick={() => setIsTenantSettingsOpen(true)}
              className="flex items-center space-x-2 whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-xs font-bold text-cyan-400 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all ml-auto"
            >
              <Building2 className="h-4 w-4 text-cyan-400" />
              <span>🏢 Organization SLA</span>
            </button>

            {/* Dedicated Auth & JWT Token Inspector Tab */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-2 whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-xs font-bold text-purple-400 hover:border-purple-500 hover:bg-purple-500/10 transition-all"
            >
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <span>🔑 User Auth & JWT Token</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Alert Simulator Modal */}
      {isSimModalOpen && (
        <AlertDispatcherModal onClose={() => setIsSimModalOpen(false)} />
      )}

      {/* Tenant SLA & Branding Settings Modal */}
      {isTenantSettingsOpen && (
        <TenantSettingsModal onClose={() => setIsTenantSettingsOpen(false)} />
      )}

      {/* User Authentication & JWT Inspector Modal */}
      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
}
