import Spinner from '../ui/Spinner.js';

export default function WaitingForApproval() {
  return (
    <div className="w-full max-w-sm rounded-card bg-surface p-8 shadow-soft border border-border">
      <div className="flex flex-col items-center text-center">
        <Spinner size="lg" />
        <h2 className="text-card-title font-semibold text-heading mt-6 mb-2">Waiting for Approval</h2>
        <p className="text-small text-text-secondary">Waiting for the receiver to accept your presentation request...</p>
      </div>
    </div>
  );
}
