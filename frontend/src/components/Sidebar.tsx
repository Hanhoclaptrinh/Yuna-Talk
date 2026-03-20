import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, User, Search, LogOut, MessageCircle, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  onLogout: () => void;
  user: any;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, user }) => {
  const { theme, toggleTheme } = useTheme();
  
  const navItems = [
    { icon: MessageSquare, label: 'Tin nhắn', to: '/dashboard' },
    { icon: Search, label: 'Tìm kiếm', to: '/dashboard/search' },
    { icon: User, label: 'Hồ sơ', to: '/dashboard/profile' },
  ];

  return (
    <div className="w-20 md:w-24 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-8 z-20 transition-colors duration-300">
      <div className="mb-12">
        <motion.div 
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </motion.div>
      </div>

      <div className="flex-1 space-y-8 flex flex-col items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) => 
              `sidebar-item group flex flex-col items-center gap-1.5 p-3 relative transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-6 h-6 transition-all group-hover:scale-110" />
                <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute inset-0 bg-primary-600/10 rounded-2xl -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-6">
        <button
          onClick={toggleTheme}
          className="text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 p-3 transition-all relative group active:scale-90"
          title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
        >
          {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
            {theme === 'dark' ? 'Sáng' : 'Tối'}
          </div>
        </button>

        <button
          onClick={onLogout}
          className="text-slate-400 dark:text-slate-500 hover:text-red-500 p-3 transition-colors relative group"
        >
          <LogOut className="w-6 h-6" />
          <div className="absolute left-full ml-2 px-2 py-1 bg-red-500 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
            Đăng xuất
          </div>
        </button>

        <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 overflow-hidden relative group cursor-pointer">
          {user?.avatar ? (
            <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
          ) : (
            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <User className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
