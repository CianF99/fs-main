import { Bell, Search, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ user, onLogout }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900/80">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search violations, vehicles, or users..."
            className="w-full rounded-xl border border-slate-200 bg-slate-100 pl-10 pr-4 py-2 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4 ml-4">
        <ThemeToggle showLabel />

        <button className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 rounded-full p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-gray-800"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-xl transition-colors dark:border-gray-800 dark:bg-gray-900">
              <div className="border-b border-slate-200 px-4 py-2 dark:border-gray-800">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 dark:text-gray-500">{user?.email || 'user@traffic.gov'}</p>
              </div>
              <button className="flex w-full items-center px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-gray-800">
                <User className="w-4 h-4 mr-2" /> Profile
              </button>
              <button 
                onClick={onLogout}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-slate-50 dark:text-red-400 dark:hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
