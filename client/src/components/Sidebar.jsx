import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, PlusCircle, CreditCard, BarChart3, LogOut, MessageSquare } from 'lucide-react';

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();

  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    ];

    if (user?.role === 'Admin') {
      return [
        ...baseItems,
        { name: 'Violations', path: '/violations', icon: AlertCircle },
        { name: 'Add Violation', path: '/add-violation', icon: PlusCircle },
        { name: 'Payments', path: '/payment', icon: CreditCard },
        { name: 'Disputes', path: '/disputes', icon: MessageSquare },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
      ];
    } else if (user?.role === 'Police') {
      return [
        ...baseItems,
        { name: 'Violations', path: '/violations', icon: AlertCircle },
        { name: 'Add Violation', path: '/add-violation', icon: PlusCircle },
        { name: 'Disputes', path: '/disputes', icon: MessageSquare },
      ];
    } else {
      return [
        ...baseItems,
        { name: 'My Violations', path: '/violations', icon: AlertCircle },
        { name: 'Payment', path: '/payment', icon: CreditCard },
        { name: 'Disputes', path: '/disputes', icon: MessageSquare },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white/90 transition-all duration-300 dark:border-gray-800 dark:bg-gray-900/95">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">TrafficSys</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`group relative flex items-center space-x-3 overflow-hidden rounded-xl px-4 py-3 transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-700 dark:text-gray-500 dark:group-hover:text-gray-300'}`} />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-gray-800">
        <button
          onClick={onLogout}
          className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-gray-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
