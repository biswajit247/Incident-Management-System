'use client';

import React, { useState } from 'react';
import { useIncidentStore } from '@/lib/store';
import { User, Role } from '@/lib/types';
import { UserCheck, ShieldAlert, Plus, Trash2, Key, Users, UserPlus, Lock } from 'lucide-react';

export default function AccessControlPage() {
  const { isLoaded, currentUser, users, addUser, removeUser, login } = useIncidentStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('SecurityLead');
  const [title, setTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isLoaded) return null;

  const isAdmin = currentUser?.role === 'OrgAdmin';

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim() || !email.trim() || !title.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (!email.toLowerCase().endsWith('@protiviti.com')) {
      setErrorMsg('Corporate policy requires all user email addresses to end with @protiviti.com');
      return;
    }

    // Generate random avatar index
    const randomSeed = Math.floor(100 + Math.random() * 900);
    const avatar = `https://images.unsplash.com/photo-${randomSeed === 100 ? '1534528741775-53994a69daeb' : '1507003211169-0a1dd7228f2d'}?auto=format&fit=crop&q=80&w=150`;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      organizationId: 'org-protiviti-in',
      role,
      title,
      avatar,
    };

    addUser(newUser);
    setName('');
    setEmail('');
    setTitle('');
    setRole('SecurityLead');
    setSuccessMsg(`Successfully provisioned access for ${name} (${role})!`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleRevokeUser = (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      setErrorMsg('Self-lockout prevention: You cannot revoke your own Organization Administrator clearance.');
      return;
    }
    removeUser(userId);
    setSuccessMsg(`Revoked corporate access credentials for ${userName}.`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  // Helper login shortcut for testing
  const handleQuickLoginAsAdmin = () => {
    login('rahul.admin@protiviti.com', 'password123');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center space-x-2">
          <UserCheck className="h-6 w-6 text-cyan-400" />
          <span>Corporate Access & IAM Management</span>
        </h1>
        <p className="mt-1 text-xs text-gray-400 font-sans">
          Manage user authorization clearances, provision keys, and audit role access policies for Protiviti India tenant
        </p>
      </div>

      {/* Restrict UI if not OrgAdmin */}
      {!isAdmin ? (
        <div className="mx-auto max-w-xl text-center p-8 rounded-2xl border border-red-500/30 bg-red-950/20 backdrop-blur-md space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
            <Lock className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Clearance Denied</h2>
            <p className="mt-2 text-xs text-gray-300">
              Your current session credentials do not possess Organization Administrator (OrgAdmin) clearance. Access control panel policies require admin SSO validation.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleQuickLoginAsAdmin}
              className="inline-flex items-center space-x-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-600/20 transition-all"
            >
              <Key className="h-4 w-4" />
              <span>Log in as Org Admin (Rahul Lal)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Create User Form */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-md h-fit space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
              <UserPlus className="h-4.5 w-4.5 text-cyan-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Provision Corporate Access</h3>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs font-semibold text-red-300">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jayesh Sen"
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. jayesh@protiviti.com"
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Lead DevOps Architect"
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">SSO Security Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="SecurityLead">SecurityLead (Read/Write Alerts)</option>
                  <option value="OrgAdmin">OrgAdmin (Full Admin Clearance)</option>
                  <option value="Reporter">Reporter (Read-Only Access)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Issue Credentials</span>
              </button>
            </form>
          </div>

          {/* Right Column: User Directory */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-gray-850 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4.5 w-4.5 text-cyan-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">Active Corporate Directory</h3>
              </div>
              <span className="text-[10px] font-mono font-semibold text-gray-500 uppercase">
                {users.length} Authorized Identities
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-400">
                <thead>
                  <tr className="border-b border-gray-850 text-gray-500 text-[10px] uppercase font-bold">
                    <th className="pb-2">User details</th>
                    <th className="pb-2">Security Role</th>
                    <th className="pb-2">SSO Domain</th>
                    <th className="pb-2 text-right">Clearance Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850">
                  {users.map(u => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr key={u.id} className="hover:bg-gray-950/20 transition-all">
                        <td className="py-3 flex items-center space-x-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="h-8 w-8 rounded-full border border-gray-700 object-cover"
                          />
                          <div>
                            <p className="font-bold text-white flex items-center">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="ml-1.5 rounded bg-cyan-500/20 text-cyan-400 px-1 py-0.5 text-[8px] font-black uppercase">
                                  YOU
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-gray-400">{u.title}</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'OrgAdmin'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : u.role === 'SecurityLead'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-gray-800 text-gray-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-[10px] text-gray-400">{u.email}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleRevokeUser(u.id, u.name)}
                            disabled={isSelf}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isSelf
                                ? 'border-gray-850 text-gray-600 cursor-not-allowed'
                                : 'border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40'
                            }`}
                            title={isSelf ? 'Cannot revoke self access' : `Revoke credentials for ${u.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
