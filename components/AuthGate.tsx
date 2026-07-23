'use client';

import React, { useState } from 'react';
import { useIncidentStore } from '@/lib/store';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { JWTPayload, User } from '@/lib/types';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { currentUser, login, isLoaded, users, organizations } = useIncidentStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jwtPayload, setJwtPayload] = useState<JWTPayload | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'jwt'>('login');
  const [ssoMode, setSsoMode] = useState(false);

  const detectedOrg = React.useMemo(() => {
    if (email.includes('@protiviti.com')) return organizations.find(o => o.id === 'org-protiviti-in');
    return null;
  }, [email, organizations]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = login(email, password);
    if (token) {
      const payload: JWTPayload = {
        sub: currentUser?.id || 'usr-101',
        email,
        orgId: detectedOrg?.id || 'org-protiviti-in',
        role: (users.find(u => u.email.toLowerCase() === email.toLowerCase())?.role || 'SecurityLead') as any,
        exp: Math.floor(Date.now() / 1000) + 86400,
      };
      setJwtPayload(payload);
    }
  };

  const handleQuickSelectUser = (user: User) => {
    setEmail(user.email);
    setPassword('password123');
    const token = login(user.email, 'password123');
    if (token) {
      setJwtPayload({
        sub: user.id,
        email: user.email,
        orgId: user.organizationId,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 86400,
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 text-white font-mono space-y-4">
        <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-wider text-gray-500 animate-pulse">Loading Sentinel Incident Control Center...</p>
      </div>
    );
  }

  // If not logged in, render the strict login page gate
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 p-4 overflow-y-auto">
        <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900/60 p-8 shadow-2xl space-y-6 backdrop-blur-md">
          
          {/* Logo & Brand Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-red-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-gray-950">
                <ShieldCheck className="h-6 w-6 text-red-500 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">SENTINEL COMMAND CENTER</h2>
              <p className="text-xs text-gray-400 mt-1">Protiviti India Member Private Limited • SSO Access Gateway</p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex space-x-2 border-b border-gray-800 pb-2 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('login')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'login' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              🔑 Credentials & SSO Login
            </button>
            {jwtPayload && (
              <button
                onClick={() => setActiveTab('jwt')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'jwt' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-gray-400 hover:text-white'
                }`}
              >
                📜 Inspect Decoded JWT Token
              </button>
            )}
          </div>

          {activeTab === 'login' ? (
            <div className="space-y-4">
              
              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Corporate Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="user@protiviti.com"
                      className="w-full rounded-xl border border-gray-800 bg-gray-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  {detectedOrg && (
                    <p className="mt-1 text-[10px] text-cyan-400 font-semibold">
                      ✓ Resolved Tenant: {detectedOrg.name} ({detectedOrg.prefix})
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-800 bg-gray-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 py-3 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all"
                  >
                    <span>Authenticate & Issue JWT</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-3 font-mono text-xs">
                <span className="block font-bold text-purple-400 uppercase tracking-wider text-[10px]">
                  Decoded OAuth2 JWT Token Payload
                </span>
                {jwtPayload ? (
                  <pre className="text-gray-300 whitespace-pre-wrap overflow-x-auto text-[10px]">
                    {JSON.stringify(jwtPayload, null, 2)}
                  </pre>
                ) : (
                  <p className="text-gray-500">No active JWT issued.</p>
                )}
              </div>

              <div className="text-[10px] text-gray-500 leading-relaxed">
                ℹ️ The generated JSON Web Token (JWT) is encoded using HMAC SHA-256 signatures, containing the sub, email, tenancy scope, and dynamic permission roles for client authorization.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
