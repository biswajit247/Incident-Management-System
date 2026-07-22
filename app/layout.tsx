import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import AuthGate from '@/components/AuthGate';

export const metadata: Metadata = {
  title: 'Sentinel - Enterprise Incident Management System',
  description: 'Automated incident triage, on-call alert escalation, SLA monitoring, war room command center, and root cause analysis studio.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
        <AuthGate>
          <Navigation />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>
        </AuthGate>
      </body>
    </html>
  );
}
