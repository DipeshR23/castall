import { useNavigate } from 'react-router-dom';
import { Monitor, Smartphone, Shield, Zap, MonitorPlay, Sun, Moon } from 'lucide-react';
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
      <section className="relative flex flex-col items-center text-center pt-12 sm:pt-16 lg:pt-24 pb-16 sm:pb-24 lg:pb-32 px-4">
        {/* Connected Badge */}
        <div className="absolute top-4 left-4 sm:left-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
            <span className="h-2 w-2 rounded-full bg-success" />
            Connected
          </div>
        </div>

        {/* Theme Toggle - positioned like screenshot */}
        <div className="absolute top-4 right-4 sm:right-8">
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

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-2 tracking-tight">
          Wireless Screen Sharing
        </h1>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-6">
          Made Simple.
        </h2>

        {/* Subtitle */}
        <p className="text-slate-500 max-w-lg mb-10 text-sm sm:text-base leading-relaxed">
          Share your screen instantly to any device using only your browser.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          <button
            type="button"
            onClick={() => navigate('/host')}
            className="flex-1 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-primary-hover transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="flex items-center justify-center gap-2">
              <Monitor className="h-5 w-5" />
              <span>Host Presentation</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/share')}
            className="flex-1 rounded-2xl bg-white border border-slate-200 px-6 py-4 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="flex items-center justify-center gap-2">
              <MonitorPlay className="h-5 w-5" />
              <span>Share Screen</span>
            </div>
          </button>
        </div>

        {/* Helper Text */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 mt-8">
          <p className="text-xs text-slate-400">Create a room and get a QR code</p>
          <p className="text-xs text-slate-400">Join a room and share your screen</p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            How it works
          </h2>
          <p className="text-sm text-slate-500">
            Just 3 simple steps
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Desktop Dotted Line */}
          <div className="hidden sm:block absolute top-6 left-0 right-0">
            <div className="flex items-center justify-center">
              <div className="h-px w-16 sm:w-24 border-t-2 border-dotted border-slate-300" />
              <div className="h-px w-16 sm:w-24 border-t-2 border-dotted border-slate-300 ml-4" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center">
                {/* Number Badge */}
                <div className="relative mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {step.num}
                  </div>
                </div>

                {/* Icon */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4">
                  <step.Icon className="h-8 w-8 sm:h-10 sm:w-10 text-slate-700" />
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                  {step.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
            {
              icon: Zap,
              title: 'Fast & Reliable',
              description: 'Built with WebRTC',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-150"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
