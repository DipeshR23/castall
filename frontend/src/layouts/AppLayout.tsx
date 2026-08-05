import { Outlet, Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.js';

export default function AppLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-200">
      <header className="h-[72px] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 sticky top-0 z-50 transition-colors duration-200">
        <Link to="/" className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5 xl:gap-4 group">
          <img src="/castall-logo.svg" alt="CastAll" className="h-7 xs:h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 2xl:h-[60px] w-auto flex-shrink-0 rounded-xl" />
          <span className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-[28px] xl:text-3xl 2xl:text-[32px] font-bold text-slate-900 dark:text-white tracking-tight">CastAll</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 rounded-button border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors min-h-[44px] min-w-[44px]"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 sm:h-5 sm:w-5" /> : <Moon className="h-5 w-5 sm:h-5 sm:w-5" />}
          <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
