import { useNavigate } from 'react-router-dom';
import { Monitor, Smartphone, Shield, MonitorPlay } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

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

        {/* Main Heading */}
        <h1 className="text-hero font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2 tracking-tight px-2">
          Wireless Screen Sharing
        </h1>
        <h2 className="text-page-title font-bold text-primary mb-4 sm:mb-6">
          Made Simple.
        </h2>

        {/* Subtitle */}
        <p className="text-body text-slate-500 dark:text-slate-400 max-w-md sm:max-w-lg mb-8 sm:mb-10 leading-relaxed px-4">
          Share your screen instantly to any device using only your browser.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-lg sm:max-w-2xl px-4 sm:px-0">
          <button
            type="button"
            onClick={() => navigate('/host')}
            className="flex-1 rounded-button bg-primary px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 text-base sm:text-lg md:text-xl font-semibold text-white shadow-soft hover:shadow-soft-hover transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <Monitor className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
              <span>Host Presentation</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/share')}
            className="flex-1 rounded-button bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 text-base sm:text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200 shadow-soft hover:shadow-soft-hover transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <MonitorPlay className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
              <span>Share Screen</span>
            </div>
          </button>
        </div>

        {/* Helper Text */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 w-full max-w-lg sm:max-w-2xl px-4 sm:px-0">
          <p className="flex-1 text-center text-small text-slate-400 dark:text-slate-500">Create a room and get a QR code</p>
          <p className="flex-1 text-center text-small text-slate-400 dark:text-slate-500">Join a room and share your screen</p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 px-4">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-section-title font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
            How it works
          </h2>
          <p className="text-small text-slate-500 dark:text-slate-400">
            Just 3 simple steps
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-12 lg:gap-16">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                {/* Number Badge */}
                <div className="mb-4 sm:mb-6">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-soft">
                    {step.num}
                  </div>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft flex items-center justify-center mb-3 sm:mb-4">
                  <step.Icon className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-slate-700 dark:text-slate-300" />
                </div>

                {/* Title */}
                <h3 className="text-small sm:text-base md:text-lg font-semibold text-slate-900 dark:text-white leading-snug px-2">
                  {step.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
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
              className="rounded-card bg-white dark:bg-slate-800 p-5 sm:p-6 shadow-soft border border-slate-200 dark:border-slate-700 hover:shadow-soft-hover transition-all duration-150"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-button bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <h3 className="text-small sm:text-base font-semibold text-slate-900 dark:text-white mb-1">
                {feature.title}
              </h3>
              <p className="text-caption text-slate-500 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
