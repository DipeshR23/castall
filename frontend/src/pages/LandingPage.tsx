import { useNavigate } from 'react-router-dom';
import { Monitor, Smartphone, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
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
  ];

  const steps = [
    {
      num: '1',
      title: 'Host',
      desc: 'Host or create a room',
      icon: '👤+',
    },
    {
      num: '2',
      title: 'Share',
      desc: 'Share the QR or room code',
      icon: '📱',
    },
    {
      num: '3',
      title: 'Present',
      desc: 'Connect and start presenting',
      icon: '🖥️',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center pt-16 sm:pt-24 pb-16 sm:pb-24">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
          Wireless Screen Sharing
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">
          Made Simple.
        </h2>
        <p className="text-slate-500 max-w-xl mb-10 text-sm sm:text-base">
          Cast your screen instantly to any device using only your browser.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate('/host')}
            className="flex-1 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-primary-hover transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Host Presentation
          </button>
          <button
            type="button"
            onClick={() => navigate('/share')}
            className="flex-1 rounded-xl bg-white border border-slate-200 px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Share Screen
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Create a room and get a QR code
        </p>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
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

      {/* How It Works Section */}
      <section className="py-16 sm:py-24">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
          How it works
        </h2>
        <p className="text-sm text-slate-500 text-center mb-12">
          Just 3 simple steps
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-4xl mx-auto">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold mb-4">
                {step.num}
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
