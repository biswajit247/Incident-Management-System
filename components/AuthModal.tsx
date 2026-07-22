'use client';

import React, { useState } from 'react';
import { X, Lock, Key, ShieldCheck, Mail, ArrowRight, Building2, UserCheck, Code, CheckCircle2 } from 'lucide-react';
import { useIncidentStore } from '@/lib/store';
import { MOCK_USERS } from '@/lib/mockData';
import { JWTPayload, User } from '@/lib/types';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { currentUser, login, organizations } = useIncidentStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jwtPayload, setJwtPayload] = useState<JWTPayload | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'jwt'>('login');
  const [ssoMode, setSsoMode] = useState(false);

  // Auto-detect organization based on email domain
  const detectedOrg = React.useMemo(() => {
    if (email.includes('@protiviti.com')) return organizations.find(o => o.id === 'org-protiviti-in');
    if (email.includes('@acme.com')) return organizations.find(o => o.id === 'org-acme-fin');
    if (email.includes('@nexus.com')) return organizations.find(o => o.id === 'org-nexus-cloud');
    return null;
  }, [email, organizations]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = login(email, password);
    if (token) {
      // Decode JWT payload
      const payload: JWTPayload = {
        sub: currentUser?.id || 'usr-101',
        email,
        orgId: detectedOrg?.id || 'org-protiviti-in',
        role: (MOCK_USERS.find(u => u.email === email)?.role || 'SecurityLead') as any,
        exp: Math.floor(Date.now() / 1000) + 86400,
      };
      setJwtPayload(payload);
    }
  };

  const handleQuickSelectUser = (user: User) => {
    setEmail(user.email);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Multi-Tenant Identity & Authentication</h2>
              <p className="text-xs text-gray-400">JWT Token Generation & Domain-Based Tenant Resolution</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-2 border-b border-gray-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('login')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
              activeTab === 'login' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
            }`}
          >
            🔑 Credentials & SSO Login
          </button>
          {jwtPayload && (
            <button
              onClick={() => setActiveTab('jwt')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                activeTab === 'jwt' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              📜 Inspect Decoded JWT Token
            </button>
          )}
        </div>

        {activeTab === 'login' ? (
          <div className="space-y-4">
            
            {/* Login Credentials Guide */}
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4.5 space-y-2 text-xs">
              <span className="block font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400">
                Enterprise Credentials Directory
              </span>
              
              <div className="grid grid-cols-1 gap-2.5 pt-1.5 text-gray-300">
                <div className="flex items-center justify-between border-b border-gray-900 pb-1.5">
                  <div>
                    <p className="font-bold text-white">Biswajit Naskar (SecurityLead)</p>
                    <p className="font-mono text-[10px] text-gray-400">biswajit@protiviti.com</p>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400">pwd: password123</span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-900 pb-1.5">
                  <div>
                    <p className="font-bold text-white">Rahul Lal (OrgAdmin)</p>
                    <p className="font-mono text-[10px] text-gray-400">rahul.admin@protiviti.com</p>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400">pwd: password123</span>
                </div>

                <div className="flex items-center justify-between pb-0.5">
                  <div>
                    <p className="font-bold text-white">Aniruddha Kar (Reporter)</p>
                    <p className="font-mono text-[10px] text-gray-400">aniruddha@protiviti.com</p>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400">pwd: password123</span>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Corporate Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@protiviti.com"
                    className="w-full rounded-xl border border-gray-800 bg-gray-900 pl-9 pr-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Domain Tenant Resolution Banner */}
              {detectedOrg ? (
                <button
                  type="button"
                  onClick={handleLoginSubmit}
                  title="Click to instantly authenticate and switch to this organization"
                  className="w-full flex items-center justify-between rounded-xl p-2.5 border text-xs text-left cursor-pointer hover:brightness-125 transition-all focus:outline-none"
                  style={{ 
                    borderColor: `${detectedOrg.badgeColor}50`, 
                    backgroundColor: `${detectedOrg.badgeColor}15` 
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-cyan-400" />
                    <div>
                      <span className="font-bold text-white">Auto-Resolved Tenant: {detectedOrg.name}</span>
                      <p className="text-[10px] text-gray-300">Subdomain: {detectedOrg.subdomain} (Prefix: {detectedOrg.prefix})</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 text-cyan-300 border border-cyan-500/30 animate-pulse">
                    CLICK TO LOGIN
                  </span>
                </button>
              ) : (
                <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-2.5 text-xs text-gray-400">
                  Type a corporate domain (e.g. <span className="text-cyan-400 font-mono">@protiviti.com</span>) to auto-resolve company tenant.
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-800 bg-gray-900 pl-9 pr-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setSsoMode(!ssoMode)}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  {ssoMode ? 'Use Standard Password Login' : 'Login via Enterprise Okta / Azure SAML SSO'}
                </button>

                <button
                  type="submit"
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2 font-bold text-white text-xs hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
                >
                  <span>Authenticate & Issue JWT</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </form>

          </div>
        ) : (
          /* JWT Token Inspector Tab */
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-purple-300">
              <Code className="h-4 w-4 text-purple-400" />
              <span>Decoded Authorization JWT Bearer Token Payload</span>
            </div>

            <pre className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 font-mono text-xs text-purple-200 overflow-x-auto leading-relaxed">
{JSON.stringify(jwtPayload, null, 2)}
            </pre>

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-3 text-xs text-gray-300 space-y-1">
              <p className="font-bold text-white">🔒 Header Authorization Format:</p>
              <code className="block rounded bg-black/60 p-2 font-mono text-cyan-400 text-[11px] overflow-x-auto">
                Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.{btoa(JSON.stringify(jwtPayload || {}))}.signature
              </code>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="flex items-center space-x-1.5 rounded-xl bg-gray-800 px-4 py-2 font-bold text-white text-xs hover:bg-gray-700"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Return to Application</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
