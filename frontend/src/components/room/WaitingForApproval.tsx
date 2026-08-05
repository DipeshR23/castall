import Spinner from '../ui/Spinner.js';

export default function WaitingForApproval() {
  return (
    <div className="w-full max-w-sm rounded-card bg-white dark:bg-slate-800 p-8 shadow-soft border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col items-center text-center">
        <Spinner size="lg" />
        <h2 className="text-card-title font-semibold text-slate-900 dark:text-white mt-6 mb-2">Waiting for Approval</h2>
        <p className="text-small text-slate-500 dark:text-slate-400">Waiting for the receiver to accept your presentation request...</p>
      </div>
    </div>
  );
}
