import { Bell, Search, User } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-4">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search everything..."
            className="block w-full rounded-full border border-slate-200 bg-surface-50 py-2 pl-10 pr-4 text-sm outline-none transition-shadow focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-900">Alex Administrator</span>
            <span className="text-xs text-slate-500">Store Manager</span>
          </div>
          <Button variant="ghost" className="h-10 w-10 p-0 rounded-full bg-slate-100 hover:bg-slate-200" size="icon">
            <User className="h-5 w-5 text-slate-700" />
          </Button>
        </div>
      </div>
    </header>
  );
}
