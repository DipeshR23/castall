import { Outlet, Link } from 'react-router-dom';
import { Monitor, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export default function AppLayout() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Monitor className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">CastAll</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            Features
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            How it works
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            About
          </Link>
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5 text-slate-600" /> : <Moon className="h-5 w-5 text-slate-600" />}
          </button>
        </nav>

        <div className="flex md:hidden items-center gap-4">
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5 text-slate-600" /> : <Moon className="h-5 w-5 text-slate-600" />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-7xl">
          <Outlet />
        </div>
      </main>

      <footer className="bg-slate-900 text-white py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Monitor className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-semibold">CastAll</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <span>Tech Stack</span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              WebRTC
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Socket.IO
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l2 2 4-4" />
              </svg>
              React
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Tailwind CSS
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Design Style</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Clean • Modern • Minimal • User Friendly</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
