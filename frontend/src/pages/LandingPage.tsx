import { useNavigate } from 'react-router-dom';
import { Monitor, Smartphone, Shield, MonitorPlay, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  const steps = [
    {
      num: '1',
      title: 'Host or create a room',
      Icon: Monitor,
    },
    {
      num: '2',
      title: 'Share the QR or room code',
      Icon: Smartphone,
    },
    {
      num: '3',
      title: 'Connect and start presenting',
      Icon: MonitorPlay,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center pt-10 sm:pt-14 md:pt-20 lg:pt-24 pb-12 sm:pb-16 md:pb-20 lg:pb-24 px-4">
        {/* Theme Toggle */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-8">
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-1.5 sm:mb-2 tracking-tight px-2">
          Wireless Screen Sharing
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-6">
          Made Simple.
        </h2>

        {/* Subtitle */}
        <p className="text-slate-500 max-w-md sm:max-w-lg mb-8 sm:mb-10 text-xs sm:text-sm md:text-base leading-relaxed px-4">
          Share your screen instantly to any device using only your browser.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md sm:max-w-lg px-4 sm:px-0">
          <button
            type="button"
            onClick={() => navigate('/host')}
            className="flex-1 rounded-xl sm:rounded-2xl bg-primary px-5 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-sm hover:bg-primary-hover transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="flex items-center justify-center gap-2">
              <Monitor className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Host Presentation</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/share')}
            className="flex-1 rounded-xl sm:rounded-2xl bg-white border border-slate-200 px-5 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="flex items-center justify-center gap-2">
              <MonitorPlay className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Share Screen</span>
            </div>
          </button>
        </div>

        {/* Helper Text */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 md:gap-12 mt-6 sm:mt-8 px-4">
          <p className="text-[11px] sm:text-xs text-slate-400">Create a room and get a QR code</p>
          <p className="text-[11px] sm:text-xs text-slate-400">Join a room and share your screen</p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 px-4">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">
            How it works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Just 3 simple steps
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-12 lg:gap-16">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                {/* Number Badge */}
                <div className="mb-4 sm:mb-6">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {step.num}
                  </div>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-3 sm:mb-4">
                  <step.Icon className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-slate-700" />
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 leading-snug px-2">
                  {step.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: Monitor,
              title: 'No Installation',
              description: '100% Browser based',
            },
            {
              icon: Smartphone,
              title: 'QR Connect',
              description: 'Scan & connect',
            },
            {
              icon: Shield,
              title: 'Secure',
              description: 'End-to-end',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-150"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
