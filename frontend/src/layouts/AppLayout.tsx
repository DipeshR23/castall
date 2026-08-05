import { Outlet, Link } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-200">
      <header className="h-[72px] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-5 sm:px-6 md:px-8 lg:px-10 sticky top-0 z-50 transition-colors duration-200">
        <Link to="/" className="flex items-center gap-2 sm:gap-2.5 md:gap-3 group">
          <img src="/castall-logo.svg" alt="CastAll" className="h-8 w-auto sm:h-9 md:h-10" />
          <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">CastAll</span>
        </Link>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
