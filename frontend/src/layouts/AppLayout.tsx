import { Outlet, Link } from 'react-router-dom';
import { Monitor, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export default function AppLayout() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Monitor className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">CastAll</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
