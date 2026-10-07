'use client';

import { useSession } from 'next-auth/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { UserRole } from '@/types/user';
import { useState } from 'react';

// test
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null; // or redirect, though middleware handles it
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar 
        role={session.user.role as UserRole} 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen} 
      />
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Header 
          session={session} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
