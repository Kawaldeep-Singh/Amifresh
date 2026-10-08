'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserPlus, Network, Package, ShoppingCart, IndianRupee, FileText, Activity, Settings, LogOut, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { UserRole } from '@/types/user';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ role, isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  
  const adminLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Registrations', href: '/admin/registrations', icon: UserPlus },
    { name: 'Network', href: '/admin/network', icon: Network },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Commissions', href: '/admin/commissions', icon: IndianRupee },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: Activity },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const managerLinks = [
    { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'My Team', href: '/manager/team', icon: Users },
    { name: 'Network', href: '/manager/network', icon: Network },
    { name: 'Registrations', href: '/manager/registrations', icon: UserPlus },
    { name: 'Sales', href: '/manager/sales', icon: ShoppingCart },
    { name: 'Commissions', href: '/manager/commissions', icon: IndianRupee },
    { name: 'Profile', href: '/manager/profile', icon: Settings },
  ];

  const memberLinks = [
    { name: 'Dashboard', href: '/member/dashboard', icon: LayoutDashboard },
    { name: 'My Referrals', href: '/member/referrals', icon: UserPlus },
    { name: 'My Network', href: '/member/network', icon: Network },
    { name: 'Products', href: '/member/products', icon: Package },
    { name: 'My Orders', href: '/member/orders', icon: ShoppingCart },
    { name: 'My Commission', href: '/member/commission', icon: IndianRupee },
    { name: 'Profile', href: '/member/profile', icon: Settings },
  ];

  const links = role === UserRole.ROOT_ADMIN ? adminLinks : role === UserRole.MANAGER ? managerLinks : memberLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-sidebar-bg text-sidebar-text border-r border-border transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link href={role === UserRole.ROOT_ADMIN ? '/admin/dashboard' : role === UserRole.MANAGER ? '/manager/dashboard' : '/member/dashboard'} className="flex items-center">
            <Image src="/Amifresh%20logo%20Light%20theam.webp" alt="Amifresh Logo" width={140} height={40} className="object-contain" />
          </Link>
          <button 
            className="lg:hidden p-2 text-sidebar-text hover:text-white rounded-md"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all mb-1 ${
                    isActive
                      ? 'bg-primary text-white shadow-[0_4px_12px_rgba(15,138,60,0.2)]'
                      : 'text-text-muted hover:bg-primary-light hover:text-primary'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-text-muted group-hover:text-primary'
                    }`}
                    aria-hidden="true"
                  />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-border p-4">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex-shrink-0 group w-full flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl text-text-muted hover:bg-danger/10 hover:text-danger transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-text-muted group-hover:text-danger" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
