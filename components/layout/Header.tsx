import { Search, Bell, Menu } from 'lucide-react';
import { Session } from 'next-auth';
import { GlobalSearch } from './GlobalSearch';

interface HeaderProps {
  session: Session | null;
  onMenuClick: () => void;
}

export function Header({ session, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-surface border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center flex-1">
        <button
          type="button"
          onClick={onMenuClick}
          className="text-text-muted hover:text-text-main focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        
        <div className="hidden lg:flex flex-1 items-center max-w-md ml-4">
          <GlobalSearch />
        </div>
      </div>
      
      <div className="ml-4 flex items-center md:ml-6">
        <button
          type="button"
          className="bg-surface p-1 rounded-full text-text-muted hover:text-text-main focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <span className="sr-only">View notifications</span>
          <Bell className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Profile */}
        <div className="ml-3 relative">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-sm">
              <p className="font-medium text-text-main truncate max-w-[150px]">{session?.user?.name}</p>
              <p className="text-xs text-text-muted capitalize">{session?.user?.role.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
