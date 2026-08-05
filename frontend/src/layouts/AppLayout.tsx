import { Outlet, Link } from 'react-router-dom';
import { Monitor } from 'lucide-react';

export default function AppLayout() {

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-200">
      <header className="h-[72px] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-50 transition-colors duration-200">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Monitor className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">CastAll</span>
        </Link>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
