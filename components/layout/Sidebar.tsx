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

  const teamLinks = [
    { name: 'Dashboard', href: '/team/dashboard', icon: LayoutDashboard },
    { name: 'My Team', href: '/team/team', icon: Users },
    { name: 'Network', href: '/team/network', icon: Network },
    { name: 'Registrations', href: '/team/registrations', icon: UserPlus },
    { name: 'Sales', href: '/team/sales', icon: ShoppingCart },
    { name: 'Commissions', href: '/team/commissions', icon: IndianRupee },
    { name: 'Profile', href: '/team/profile', icon: Settings },
  ];

  const sakhiLinks = [
    { name: 'Dashboard', href: '/sakhi/dashboard', icon: LayoutDashboard },
    { name: 'My Referrals', href: '/sakhi/referrals', icon: UserPlus },
    { name: 'My Network', href: '/sakhi/network', icon: Network },
    { name: 'Products', href: '/sakhi/products', icon: Package },
    { name: 'My Orders', href: '/sakhi/orders', icon: ShoppingCart },
    { name: 'My Commission', href: '/sakhi/commission', icon: IndianRupee },
    { name: 'Profile', href: '/sakhi/profile', icon: Settings },
  ];

  const links = role === UserRole.ROOT_ADMIN ? adminLinks : role === UserRole.TEAM ? teamLinks : sakhiLinks;

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
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#142318] text-white border-r border-[#1e3b26] transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-20 px-4 border-b border-[#1e3b26] relative">
          <Link href={role === UserRole.ROOT_ADMIN ? '/admin/dashboard' : role === UserRole.TEAM ? '/team/dashboard' : '/sakhi/dashboard'} className="flex items-center">
            <Image src="/amifresh-dark-thema.webp" alt="Amifresh Logo" width={160} height={45} className="object-contain" />
          </Link>
          <button
            className="lg:hidden absolute right-4 p-2 text-gray-300 hover:text-white rounded-md"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="space-y-2 px-4">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#2E7C31] text-white'
                      : 'text-gray-200 hover:bg-[#1b3121] hover:text-white'
                  }`}
                >
                  <Icon
                    className={`mr-4 h-5 w-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    }`}
                    aria-hidden="true"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-[#1e3b26] p-4">
          <button
            onClick={() => signOut({ callbackUrl: '/register' })}
            className="flex-shrink-0 group w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-200 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="mr-4 h-5 w-5 flex-shrink-0 text-gray-300 group-hover:text-red-400" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
